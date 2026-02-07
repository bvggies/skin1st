# Migrate data from Neon PostgreSQL to AWS Aurora PostgreSQL

Follow these steps to backup all data from Neon and load it into Aurora. Business logic and schema are unchanged; only the database host is switched.

## Prerequisites

- **Neon** connection string (source) and **Aurora** connection string (target).
- **PostgreSQL client tools** installed: `pg_dump` and `psql` (from [PostgreSQL downloads](https://www.postgresql.org/download/) or use a Docker one-off).
- **Node/npm** for Prisma migrations.

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
