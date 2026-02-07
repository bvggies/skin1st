# Aurora Migration – Step-by-Step

Do these in order. Check off each step before moving to the next.

---

## Step 1: Apply schema on Aurora (migrations)

**Goal:** Create all tables on Aurora so we can load data.

**Option A – Using the helper script (recommended):**

1. In **api/.env** (or root **.env**), set your Aurora password:
   ```
   AWS_POSTGRES_PASSWORD=your_actual_aurora_password
   ```
   (Other Aurora vars are already in api/.env: host, port, db, user.)

2. From the project root, run:
   ```bash
   npm run apply-schema-aurora
   ```
   Or: `node scripts/apply-schema-aurora.js`

3. You should see: `All migrations have been successfully applied.`

**Option B – Using DATABASE_URL in the shell:**

1. Set your Aurora connection URL (use your real password):

   **Windows (PowerShell):**
   ```powershell
   $env:DATABASE_URL = "postgresql://postgres:YOUR_AURORA_PASSWORD@skin1stdb.cluster-c830kk0kmcgf.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require"
   ```

   **Mac/Linux (bash):**
   ```bash
   export DATABASE_URL="postgresql://postgres:YOUR_AURORA_PASSWORD@skin1stdb.cluster-c830kk0kmcgf.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require"
   ```

2. From the project root, run:
   ```bash
   cd api
   npx prisma migrate deploy --schema=../prisma/schema.prisma
   ```

3. You should see: `All migrations have been successfully applied.`  
   If you see "column already exists" or "relation already exists", some migrations were already applied; use `npx prisma migrate resolve --applied "MIGRATION_NAME"` for that migration, then run `migrate deploy` again.

**Done?** Aurora now has the same schema as your app (empty tables).

---

## Step 2: Dump data from Neon

**Goal:** Export all data from Neon into a file.

**Option A – Using pg_dump (if PostgreSQL client is installed):**

1. Set your Neon connection string (pooled URL from Neon dashboard):

   **Windows:**
   ```powershell
   $env:DATABASE_URL_SOURCE = "postgresql://neondb_owner:PASSWORD@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

   **Mac/Linux:**
   ```bash
   export DATABASE_URL_SOURCE="postgresql://neondb_owner:PASSWORD@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

2. Run (from project root):

   **Mac/Linux / Git Bash:**
   ```bash
   pg_dump "$DATABASE_URL_SOURCE" --data-only --no-owner --inserts -f scripts/neon_data.sql
   ```

   **Windows (cmd):** If `pg_dump` is in PATH:
   ```cmd
   pg_dump %DATABASE_URL_SOURCE% --data-only --no-owner --inserts -f scripts\neon_data.sql
   ```

**Option B – Using Docker (no local PostgreSQL needed):**

```bash
docker run --rm -v "%cd%\scripts:/out" -e PGPASSWORD=YOUR_NEON_PASSWORD postgres:15 pg_dump -h ep-xxx-pooler.us-east-1.aws.neon.tech -U neondb_owner -d neondb --data-only --no-owner --inserts -f /out/neon_data.sql
```

Replace:
- `YOUR_NEON_PASSWORD` with your Neon password
- `ep-xxx-pooler.us-east-1.aws.neon.tech` with your Neon host from the connection string

After this, `scripts/neon_data.sql` should exist and contain INSERT statements.

**Done?** You have a file with all Neon data.

---

## Step 3: Load data into Aurora

**Goal:** Import the dump file into Aurora.

1. Set your Aurora connection URL (same as Step 1):

   **Windows:**
   ```powershell
   $env:DATABASE_URL_TARGET = "postgresql://postgres:YOUR_AURORA_PASSWORD@skin1stdb.cluster-c830kk0kmcgf.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require"
   ```

   **Mac/Linux:**
   ```bash
   export DATABASE_URL_TARGET="postgresql://postgres:YOUR_AURORA_PASSWORD@skin1stdb.cluster-c830kk0kmcgf.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require"
   ```

2. Run the load:

   **Mac/Linux / Git Bash:**
   ```bash
   ( echo "SET session_replication_role = replica;"; cat scripts/neon_data.sql; echo "SET session_replication_role = DEFAULT;"; ) | psql "$DATABASE_URL_TARGET" -v ON_ERROR_STOP=1
   ```

   **Or use the script (Mac/Linux/Git Bash):**
   ```bash
   chmod +x scripts/migrate-neon-to-aurora.sh
   # Only the LOAD part - you already have neon_data.sql from Step 2
   ( echo "SET session_replication_role = replica;"; cat scripts/neon_data.sql; echo "SET session_replication_role = DEFAULT;"; ) | psql "$DATABASE_URL_TARGET" -v ON_ERROR_STOP=1
   ```

   **Windows (if psql is in PATH):**
   ```cmd
   psql %DATABASE_URL_TARGET% -v ON_ERROR_STOP=1 -f scripts\neon_data.sql
   ```
   If you get FK errors, use Docker with the same pipe as above (replica role) or run the SQL file in a GUI (e.g. pgAdmin) with `SET session_replication_role = replica` before and `DEFAULT` after.

**Done?** Aurora now has all your data.

---

## Step 4: Verify data

**Goal:** Confirm Aurora has the same data as Neon.

1. **Row counts (optional but recommended)**  
   In Neon and in Aurora, run:

   ```sql
   SELECT 'User' AS tbl, COUNT(*) FROM "User"
   UNION ALL SELECT 'Product', COUNT(*) FROM "Product"
   UNION ALL SELECT 'Order', COUNT(*) FROM "Order"
   UNION ALL SELECT 'Category', COUNT(*) FROM "Category";
   ```

   Compare the numbers; they should match.

2. **Health check (app pointing at Aurora)**  
   In your `.env` (or `api/.env`), set `DATABASE_URL` to your **Aurora** URL (same as Step 1). Then:

   ```bash
   cd api
   npx vercel dev
   ```

   In another terminal or browser: `GET http://localhost:3000/api/health`  
   You should get: `{ "ok": true, "uptime": ..., "db": "healthy" }`.

3. **Smoke test**  
   In the same local app (still using Aurora URL): open the site, log in, open a product, add to cart, place an order (or at least open cart and checkout). If that works, Aurora is good to use.

**Done?** You’ve confirmed Aurora has the data and the app talks to it.

---

## Step 5: Switch production (Vercel) to Aurora

**Goal:** Use Aurora in production and stop using Neon.

1. In **Vercel** → your project → **Settings** → **Environment Variables**:

   - Either set **DATABASE_URL** to your Aurora URL:
     ```
     postgresql://postgres:YOUR_PASSWORD@skin1stdb.cluster-c830kk0kmcgf.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require
     ```
   - Or set these (and leave DATABASE_URL unset):
     - **AWS_POSTGRES_HOST** = `skin1stdb.cluster-c830kk0kmcgf.us-east-1.rds.amazonaws.com`
     - **AWS_POSTGRES_PORT** = `5432`
     - **AWS_POSTGRES_DB** = `postgres`
     - **AWS_POSTGRES_USER** = `postgres`
     - **AWS_POSTGRES_PASSWORD** = (your Aurora password)

2. **Redeploy** the project (e.g. trigger a new deployment or push a commit).

3. After deploy, call: `GET https://your-app.vercel.app/api/health`  
   You should get `{ "ok": true, "db": "healthy" }`.

4. Do a quick production smoke test (login, product, cart/order).

**Done?** Production is now on Aurora.

---

## Step 6: Clean up (optional)

- Remove or rotate Neon credentials from Vercel and local `.env` if you no longer use Neon.
- Keep a backup of `scripts/neon_data.sql` until you’re sure Aurora is stable.
- You can delete `scripts/neon_data.sql` from the repo (add it to `.gitignore` if you run the dump again) so secrets are not committed.

---

## Quick reference – Your Aurora details

| Variable | Value |
|----------|--------|
| Host | `skin1stdb.cluster-c830kk0kmcgf.us-east-1.rds.amazonaws.com` |
| Port | `5432` |
| Database | `postgres` |
| User | `postgres` |
| SSL | `sslmode=require` |

**Connection URL format:**
```
postgresql://postgres:YOUR_PASSWORD@skin1stdb.cluster-c830kk0kmcgf.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require
```

Replace `YOUR_PASSWORD` with your actual Aurora password.
