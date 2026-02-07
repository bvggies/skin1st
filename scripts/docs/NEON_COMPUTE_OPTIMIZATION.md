# PostgreSQL Compute Optimization (Neon → AWS Aurora)

This document summarizes **high-compute anti-patterns** that were identified and fixed. The app has been **migrated to AWS Aurora PostgreSQL (Serverless v2)**; the same rules (connection limit, caching, no polling, rate limiting) apply to keep Aurora compute and connections under control.

---

## Section 1: Critical compute drains (fixed)

### 1.1 Persistent / unpooled DB connections in serverless

**Why it increases compute:** Each Vercel serverless invocation can create a new `PrismaClient` and open a new TCP connection to PostgreSQL. On the free tier, many concurrent or frequent requests = many connections = Neon compute stays active and exhausts quickly.

**What was done:**
- **`api/db.ts`**  
  - Documented that Prisma must not hold persistent connections; one client per process.  
  - Reduced log level in production to `['error']` to avoid extra I/O.
- **`env.template`**  
  - **DATABASE_URL** must use Neon’s **pooled** connection string (host contains `-pooler`).  
  - Direct (non-pooled) URLs in serverless cause one connection per request and quickly exhaust compute.

**Rule:** Use Neon’s **pooled** URL in production. In Neon dashboard: Connection string → choose **“Pooled connection”**, not “Direct”.

---

### 1.2 Read-heavy APIs with no caching

**Why it increases compute:** Every page load (Home, Shop, product page, etc.) triggered direct DB hits for products, categories, brands, site-settings. No CDN or browser cache = DB and Neon compute on every request.

**What was done:**
- **`api/middleware/security.ts`**  
  - Added `setCacheHeaders(res, maxAge, staleWhileRevalidate)`.
- Applied **Cache-Control** and **rate limiting** to all public read-only GET endpoints:

| Endpoint | Cache (s-maxage / stale-while-revalidate) | Rate limit |
|----------|------------------------------------------|------------|
| `GET /api/products` (list + by slug) | 60 / 300 | apiRateLimit (60/min) |
| `GET /api/site-settings` | 300 / 600 | apiRateLimit |
| `GET /api/categories` | 120 / 300 | apiRateLimit |
| `GET /api/brands` | 120 / 300 | apiRateLimit |
| `GET /api/products/related` | 60 / 300 | apiRateLimit |
| `GET /api/products/:slug` (rewrite) | 60 / 300 | apiRateLimit |
| `GET /api/orders/track` | — | apiRateLimit |

**Rule:** All read-heavy public GET endpoints must set Cache-Control and use rate limiting so the same request doesn’t hit the DB every time.

**Additional public GET endpoints (audit):**
- **`GET /api/products/:slug/reviews`** (`api/products.reviews.ts`) — Added `apiRateLimit` + `setCacheHeaders(60, 300)` so product reviews are cached and rate-limited.
- **`GET /api/variants?ids=...`** (`api/variants.ts`) — Added `apiRateLimit` + `setCacheHeaders(60, 300)` so variant lookups (cart/checkout) are cached and rate-limited.
- **`POST /api/coupons.validate`** (`api/coupons.validate.ts`) — Explicit user action (apply coupon at checkout); added `apiRateLimit` to prevent abuse.

---

### 1.3 Polling on the frontend

**Why it increases compute:** Timers that refetch data (e.g. every 30s or 60s) cause repeated DB queries even when no user action occurs. With multiple tabs or admins, this multiplies load.

**What was done:**
- **`client/src/components/AdminLayout.tsx`**  
  - Removed `refetchInterval: 30000` for pending orders count.  
  - Use `staleTime: 2 * 60 * 1000` and `refetchOnWindowFocus: true` only.
- **`client/src/pages/admin/Analytics.tsx`**  
  - Removed `refetchInterval: 60000`.  
  - Use `staleTime: 2 * 60 * 1000` and `refetchOnWindowFocus: true`.

**Rule:** No `refetchInterval` (or equivalent polling) for DB-backed data. Rely on user actions, navigation, or window focus for refetch.

---

### 1.4 Public APIs without rate limiting

**Why it increases compute:** Unthrottled public endpoints (products, categories, brands, site-settings, track) allow bots or abuse to hammer the DB and exhaust compute.

**What was done:**  
All of the public GET endpoints listed in 1.2 now use `apiRateLimit` (60 requests per minute per client).

**Rule:** All public API routes must be rate limited (and read-heavy ones cached as above).

---

### 1.5 N+1 queries in admin analytics

**Why it increases compute:** One query per “top product” variant (e.g. 10 extra queries per analytics request) increases DB round-trips and compute time.

**What was done:**  
**`api/admin/analytics.ts`**  
- Replaced per-variant `prisma.variant.findUnique` in a loop with a single `prisma.variant.findMany({ where: { id: { in: variantIds } }, include: { product: { select: { name: true } } } })` and a map for lookup.

**Rule:** Avoid N+1: batch by ID with `findMany` + in-memory map instead of loops of `findUnique`.

---

### 1.6 Missing indexes on hot query paths

**Why it increases compute:** Product list (filter by category, brand, isAdult, order by updatedAt) and order list (filter by status, user, order by createdAt) can do full table scans without indexes.

**What was done:**  
**`prisma/schema.prisma`**  
- **Product:** `@@index([categoryId])`, `@@index([brandId])`, `@@index([isAdult])`, `@@index([updatedAt])`.  
- **Order:** `@@index([status])`, `@@index([createdAt])`, `@@index([userId])`.

Migration: `prisma/migrations/20260205000000_add_product_order_indexes/migration.sql`.

**Rule:** Add indexes for all filters and sort columns used in list/dashboard queries.

---

## Section 2: Medium-risk compute usage (mitigated)

- **Home page categories/products:**  
  `staleTime` added for categories (5 min) and featured products (2 min) so revisiting Home doesn’t refetch every time.
- **Search autocomplete:**  
  `staleTime: 60 * 1000` so the same search term isn’t refetched repeatedly.
- **Rate limiter is in-memory:**  
  On Vercel, each serverless instance has its own map, so limits are per-instance (e.g. 60/min per instance). For stricter global limits, use Redis or Vercel KV later; current setup still reduces total load.
- **Dev/preview DB:**  
  Ensure preview deployments use a separate DB or pooled URL; avoid pointing dev at production DB (see env.template and Section 4).

---

## Section 3: Optimized code snippets (before → after)

### 3.1 DB client (`api/db.ts`)

- **Before:** Single global PrismaClient, no comment about pooling.  
- **After:** Explicit “one client per process”, no persistent connections; log level `['error']` in prod; env.template instructs to use Neon **pooled** URL.

### 3.2 Public products API (`api/products.ts`)

- **Before:** No Cache-Control, no rate limit.  
- **After:** `apiRateLimit(req, res)` at start of GET; `setCacheHeaders(res, 60, 300)` before returning product list and single product.

### 3.3 Admin pending orders count (`client/src/components/AdminLayout.tsx`)

- **Before:** `refetchInterval: 30000`, `staleTime: 10000`.  
- **After:** No `refetchInterval`; `staleTime: 2 * 60 * 1000`, `refetchOnWindowFocus: true`.

### 3.4 Admin analytics N+1 (`api/admin/analytics.ts`)

- **Before:** `Promise.all(topProducts.map(async (item) => prisma.variant.findUnique(...)))`.  
- **After:** `prisma.variant.findMany({ where: { id: { in: variantIds } }, include: { product: { select: { name: true } } } })` + `Map` for lookup.

---

## Section 4: Final recommendations for Neon + Vercel free tier

1. **DATABASE_URL**  
   - Always use Neon’s **pooled** connection string in Vercel (and any serverless).  
   - Never use the direct connection string for the app in production.

2. **No persistent connections**  
   - Do not hold long-lived PostgreSQL connections in serverless.  
   - Rely on pooled URL; optionally consider `@prisma/adapter-neon` + Neon serverless driver for future reductions in connection churn.

3. **No DB on every request for public pages**  
   - Cache read-heavy GET responses (Cache-Control with s-maxage and optional stale-while-revalidate).  
   - Use client-side `staleTime` so repeated navigations don’t refetch the same data.

4. **No polling**  
   - No `refetchInterval` (or equivalent) for DB-backed data.  
   - Refetch only on user action, route change, or window focus.

5. **DB only on explicit actions or cached revalidation**  
   - Mutations (cart, orders, auth, admin) remain on-demand.  
   - Reads should be cacheable (with appropriate TTLs) or driven by user actions.

6. **Auth + rate limiting**  
   - Admin and user-specific routes are already behind auth.  
   - All public read endpoints now have rate limiting and caching.

7. **Indexes**  
   - Run the new migration so Product and Order list/dashboard queries use the new indexes.  
   - Add indexes for any new high-traffic filters or sort columns.

8. **Environments**  
   - Use a separate DB (or at least pooled URL) for preview/dev; do not point production and preview at the same non-pooled direct URL.

---

## Estimated impact

- **Connection usage:** Pooled URL prevents connection-per-request; compute should no longer be dominated by connection churn.  
- **Query volume:** Caching + no polling + rate limits can cut read query volume significantly (on the order of 50–80% for typical browsing).  
- **Per-request cost:** Analytics N+1 fix and indexes reduce round-trips and CPU per request.  

With these changes, the app is in a much better position to run long-term on **0.25 CU** for low traffic. Remaining risks: very high traffic (consider stricter rate limits or Redis-backed limits), and any new endpoints that hit the DB without caching or rate limiting—keep applying the rules above to those as well.
