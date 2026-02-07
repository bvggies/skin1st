# Creating the First Admin User

If you cannot log in as admin (e.g. after a fresh RDS database or new deployment), the admin user may not exist yet. Create it with the script below.

## Prerequisites

- Database is migrated (schema is up to date).
- `DATABASE_URL` points to your database (e.g. RDS PostgreSQL).

## Steps

1. **Set your database URL** (if not already in `api/.env`):
   ```bash
   # In api/.env or as env var when running the command:
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
   ```

2. **From the project root**, run the create-admin script. It uses `api`’s Prisma, so run from root with env loaded from `api`:
   ```bash
   cd api
   npx dotenv -e .env -- node ../prisma/scripts/create-admin.js "admin@example.com" "YourSecurePassword" "Admin Name"
   ```
   Or if you have `dotenv-cli` at the root:
   ```bash
   cd api && npx dotenv -e .env -- node ../prisma/scripts/create-admin.js "admin@example.com" "YourSecurePassword" "Admin Name"
   ```
   Or set `DATABASE_URL` in your shell and run:
   ```bash
   npm run prisma:create-admin -- "admin@example.com" "YourSecurePassword" "Admin Name"
   ```
   (The script lives in `prisma/scripts/create-admin.js` and is invoked by the `prisma:create-admin` npm script; ensure `DATABASE_URL` is set in the environment when you run it.)

3. **Arguments** (all optional; defaults shown):
   - Email: `admin@example.com`
   - Password: `Admin123!`
   - Name: `Admin User`

   Example with custom values:
   ```bash
   node prisma/scripts/create-admin.js "you@yourdomain.com" "MyStr0ngPass!" "Site Admin"
   ```

4. **Log in** in the app with the email and password you used. Change the password after first login if you used a default.

## Why the shop is empty

- **Shop** shows products from the database. If the DB has no products, the shop will be empty; the empty state will say “No products in the shop yet” and suggest going to Home.
- **Home** “Featured products” can show sample/placeholder products when the API returns no products, so Home may still show items even when the DB is empty.
- To have real products on both Shop and Home: run the Prisma seed (if it creates products) or add products via the admin panel after logging in with the admin account you created above.
