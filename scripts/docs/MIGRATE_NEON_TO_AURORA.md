# Migrate data from Neon PostgreSQL to AWS Aurora/RDS PostgreSQL

Follow these steps to copy all data from Neon into your new database (Aurora or RDS). Schema must already exist on the target (run Prisma migrations first).

---

## Option A: Node.js script (recommended on Windows)

No `pg_dump`/`psql` required. Uses the `pg` package to copy table-by-table.

### 1. Install dependency and set env

From project root:

```bash
npm install
```

Set environment variables:

- **DATABASE_URL_SOURCE** – Your Neon connection string (e.g. from `.env` or `api/.env`).
- **DATABASE_URL_TARGET** – Your RDS/Aurora connection string.

Example (PowerShell):

```powershell
$env:DATABASE_URL_SOURCE = "postgresql://neondb_owner:PASSWORD@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
$env:DATABASE_URL_TARGET = "postgresql://postgres:PASSWORD@skin1st-db.xxx.eu-north-1.rds.amazonaws.com:5432/postgres?sslmode=require"
```

Example (bash):

```bash
export DATABASE_URL_SOURCE="postgresql://..."
export DATABASE_URL_TARGET="postgresql://..."
```

### 2. Ensure target schema is up to date

Migrations must be applied on the **target** DB first:

```bash
cd api
node -r dotenv/config ../node_modules/.bin/prisma migrate deploy --schema=../prisma/schema.prisma
```

Use a `.env` in `api/` that has `DATABASE_URL` pointing at RDS (or set `DATABASE_URL` in the shell for this command).

### 3. Run the copy script

From project root:

```bash
npm run copy-neon-to-rds
```

Or with env from a file:

```bash
node -r dotenv/config scripts/copy-neon-to-rds.js
```

(Add `DATABASE_URL_SOURCE` and `DATABASE_URL_TARGET` to `.env` if you use this.)

The script copies all tables in FK-safe order. Rows that already exist (e.g. an admin user you created on RDS) are skipped (ON CONFLICT DO NOTHING). To get an exact clone of Neon, truncate the target tables (or drop and re-run migrations) before running the script.

### 4. Verify and switch app

- Point the app at RDS (`DATABASE_URL` or `AWS_POSTGRES_*` in Vercel and local).
- Call `GET /api/health` and check row counts for User, Product, Order.

---

## Option B: pg_dump + psql (Linux/macOS or Docker)

## Prerequisites

- **Neon** connection string (source) and **Aurora/RDS** connection string (target).
- **PostgreSQL client tools** installed: `pg_dump` and `psql`, or use Docker.

## Step 1: Apply schema on Aurora (migrations)

Schema must exist on Aurora before loading data. From the project root:

```bash
# Point to Aurora (use your Aurora URL; include sslmode=require)
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@skin1stdb.cluster-c830kk0kmcgf.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require"

cd api
npx prisma migrate deploy --schema=../prisma/schema.prisma
```

Confirm all migrations apply. Do not run seed yet.

## Step 2: Dump data from Neon

Set your Neon connection string (pooled or direct), then dump **data only** (no schema):

```bash
# Source = Neon
export DATABASE_URL_SOURCE="postgresql://user:password@your-project-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Dump data only; use INSERT for portability
pg_dump "$DATABASE_URL_SOURCE" \
  --data-only \
  --no-owner \
  --inserts \
  --on-conflict-do-nothing \
  -f neon_data.sql
```

If `pg_dump` is not in PATH (e.g. on Windows), use Docker:

```bash
docker run --rm -e PGPASSWORD=yourpass postgres:15 pg_dump -h your-project-pooler.us-east-1.aws.neon.tech -U neondb_owner -d neondb --data-only --no-owner --inserts -f /tmp/neon_data.sql
# Then copy file out of container, or mount a volume.
```

Or use a one-liner that writes to a host file:

```bash
docker run --rm -v "%cd%":/out -e PGPASSWORD=xxx postgres:15 pg_dump -h HOST -U USER -d DB --data-only --no-owner --inserts -f /out/neon_data.sql
```

## Step 3: Load data into Aurora

Disable triggers and foreign key checks during load, then run the dump file:

```bash
# Target = Aurora
export DATABASE_URL_TARGET="postgresql://postgres:YOUR_PASSWORD@skin1stdb.cluster-c830kk0kmcgf.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require"

# Optional: disable triggers so insert order doesn't matter (Postgres 9.x+)
psql "$DATABASE_URL_TARGET" -v ON_ERROR_STOP=1 -c "SET session_replication_role = replica;"
psql "$DATABASE_URL_TARGET" -v ON_ERROR_STOP=1 -f neon_data.sql
psql "$DATABASE_URL_TARGET" -v ON_ERROR_STOP=1 -c "SET session_replication_role = DEFAULT;"
```

If your dump uses `INSERT`, run the SQL file directly (session_replication_role may not be needed if insert order is correct):

```bash
psql "$DATABASE_URL_TARGET" -v ON_ERROR_STOP=1 -f neon_data.sql
```

If you see duplicate-key or FK errors, ensure migrations on Aurora are up to date and that you did not run seed on Aurora before loading (seed can create conflicting IDs). Fix any conflicting rows and re-run the failing part of the script.

## Step 4: Verify

1. **Row counts** – Compare Neon and Aurora row counts for important tables (e.g. User, Product, Order).
2. **Health check** – Point the app at Aurora (`DATABASE_URL` or `AWS_POSTGRES_*`) and call `GET /api/health`. You should get `{ "ok": true, "db": "healthy" }`.
3. **Smoke test** – Log in, load products, create an order (or use existing flows).

## Step 5: Switch app to Aurora

In Vercel (and local `.env`), set:

- **Option A:** `DATABASE_URL` to your Aurora connection string (with `?sslmode=require`).
- **Option B:** `AWS_POSTGRES_HOST`, `AWS_POSTGRES_DB`, `AWS_POSTGRES_USER`, `AWS_POSTGRES_PASSWORD`, `AWS_POSTGRES_PORT` (no need to set `DATABASE_URL`).

Redeploy. After verification, you can retire Neon.

## Troubleshooting

- **SSL required:** Aurora requires SSL. Use `?sslmode=require` in the URL.
- **Connection limit:** The app adds `connection_limit=5` automatically; no need to set it in the URL.
- **Duplicate key errors on load:** Ensure you did not run seed on Aurora before loading. If you did, clear conflicting tables (or drop and re-run migrations) then re-run the data load.
- **pg_dump/psql not found:** Install PostgreSQL client tools or use the Docker method above.
