# AWS Aurora Migration – Summary

## Modified files

| File | Change |
|------|--------|
| **api/db.ts** | Single Prisma client (singleton). Connection URL from `DATABASE_URL` or built from `AWS_POSTGRES_*`. Enforces `connection_limit=5` and `sslmode=require` on the URL. No Neon-specific code. |
| **api/health.ts** | Health check runs `SELECT 1` via Prisma; returns `db: 'healthy'` (200) or `db: 'unhealthy'` (503). |
| **env.template** | Neon section replaced with AWS Aurora. Added `AWS_POSTGRES_HOST`, `AWS_POSTGRES_PORT`, `AWS_POSTGRES_DB`, `AWS_POSTGRES_USER`, `AWS_POSTGRES_PASSWORD`. Removed Neon-only variables. |
| **.env.example** | Added Aurora / `AWS_POSTGRES_*` example; `DATABASE_URL` remains supported. |
| **scripts/migrate-neon-to-aurora.sh** | New. Dumps data from Neon (`DATABASE_URL_SOURCE`) and loads into Aurora (`DATABASE_URL_TARGET`) using `pg_dump` / `psql`. |
| **scripts/docs/MIGRATE_NEON_TO_AURORA.md** | New. Step-by-step: apply migrations on Aurora, dump Neon, load into Aurora, verify, switch app. |
| **scripts/docs/NEON_COMPUTE_OPTIMIZATION.md** | Title/note updated to mention Aurora migration. |

## Connection management

- **One client per process:** `api/db.ts` uses a single `PrismaClient` (global in dev, one per serverless invocation in prod).
- **Max 5 connections per instance:** URL is built or amended to include `connection_limit=5` so Aurora does not see runaway connections.
- **SSL:** `sslmode=require` is added if missing (required for Aurora).

## Environment variables

- **Option A:** Set `DATABASE_URL` (e.g. `postgresql://user:pass@host:5432/db?sslmode=require`). `connection_limit=5` is added automatically if absent.
- **Option B:** Set `AWS_POSTGRES_HOST`, `AWS_POSTGRES_DB`, `AWS_POSTGRES_USER`, `AWS_POSTGRES_PASSWORD`, `AWS_POSTGRES_PORT`; URL is built in code (with SSL and connection limit).

No credentials are hardcoded. Use Vercel env vars or AWS Secrets Manager in production.

## Data migration (Neon → Aurora)

1. Apply Prisma migrations on Aurora: `DATABASE_URL=<aurora_url> npx prisma migrate deploy`.
2. Dump Neon: set `DATABASE_URL_SOURCE` (Neon), run `scripts/migrate-neon-to-aurora.sh` or follow `scripts/docs/MIGRATE_NEON_TO_AURORA.md` (includes Docker option).
3. Load into Aurora: script loads dump into `DATABASE_URL_TARGET` (Aurora) with FK triggers disabled during load.
4. Verify: row counts, `GET /api/health` returns `db: 'healthy'`, smoke-test app.
5. Switch app to Aurora: set `DATABASE_URL` or `AWS_POSTGRES_*` in Vercel and redeploy.

## Verification

- **Health:** `GET /api/health` runs `SELECT 1`; response includes `db: 'healthy'` or `db: 'unhealthy'` (503).
- **Connections:** Each serverless instance uses at most 5 DB connections (`connection_limit=5`).
- **Idle:** No persistent connections across requests; Prisma client is per-process and request-scoped in serverless.

## Risks and follow-up

- **Vercel + Aurora:** Ensure Vercel can reach Aurora (e.g. public accessibility or VPC integration). If Aurora is in a private VPC, use a proxy or Vercel’s AWS integration.
- **First deploy:** Set `DATABASE_URL` or all `AWS_POSTGRES_*` in Vercel before deploying; otherwise the app will throw at startup when creating the DB client.
- **Prisma generate:** `prisma generate` reads `DATABASE_URL` from the environment; for CI/build, a dummy URL is enough since the real URL is injected at runtime via `api/db.ts`.
- **Existing caching/rate limits:** All read-heavy and public API routes already use Cache-Control and rate limiting; no change required for Aurora.
