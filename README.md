# Skin1st Beauty Therapy — Monorepo

Monorepo scaffold for the Skin1st Beauty Therapy e-commerce app.

Quick start

1. Install dependencies (root supports workspaces):
   - npm install
2. Start the client locally:
   - cd client && npm start
3. Vercel configuration is at `vercel.json`. Rewrites route `/api` to serverless functions.

Prisma & DB setup ✅

1. Create a Neon Postgres database and copy the `DATABASE_URL`.
2. Add the `DATABASE_URL` to your local `.env` or set it in Vercel project secrets.
3. Install deps and generate Prisma client:
   - npm install (root) -> installs workspace packages
   - cd api && npm install

4. Generate client and run migrations (from root):
   - npm run prisma:generate
   - npm run prisma:migrate:dev

5. Seed initial data:
   - npm run prisma:seed

Notes:
- The Prisma schema is at `prisma/schema.prisma`.
- We included `prisma/seed.js` to bootstrap categories, brands & sample products.

Next steps:
- Implement backend API handlers under `/api`
- Build out the CRA frontend under `/client`

