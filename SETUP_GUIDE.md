# 🚀 Complete Setup Guide

This guide will walk you through setting up the Oil Store e-commerce platform from scratch to production.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon, Supabase, or any PostgreSQL provider)
- Vercel account (for deployment)
- GitHub account

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd oilstore

# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install API dependencies
cd api && npm install && cd ..
```

## Step 2: Environment Setup

### Option A: Interactive Setup (Recommended)

```bash
npm run setup:env
```

This interactive script will:
- Guide you through setting up your `.env` file
- Generate secure JWT secrets automatically
- Ask for required configuration values

### Option B: Manual Setup

1. **Generate JWT Secrets** (if needed):
   ```bash
   npm run generate:secrets
   ```
   Copy the generated secrets to your `.env` file.

2. **Create `.env` file** in the root directory:
   
   **Quick method**: Copy the template:
   ```bash
   cp env.template .env
   ```
   
   Then edit `.env` with your actual values. See `env.template` for all available options with descriptions.

3. **Get Database URL**:
   - Sign up for [Neon](https://neon.tech) or [Supabase](https://supabase.com)
   - Create a new PostgreSQL database
   - Copy the connection string
   - Replace `DATABASE_URL` in your `.env` file

## Step 3: Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates all tables)
npm run prisma:migrate:dev

# Seed initial data (categories, brands, sample products)
npm run prisma:seed
```

The seed script creates:
- Sample categories and brands
- Demo products
- Test admin user: `admin@skin1st.test` / `AdminPass123!`
- Test customer user: `jane@doe.test` / `CustomerPass123!`

⚠️ **Important**: Change these default passwords immediately!

## Step 4: Create Admin User

### Option A: Use the Script (Recommended)

```bash
npm run prisma:create-admin <email> <password> [name]
```

Example:
```bash
npm run prisma:create-admin admin@yourstore.com "SecurePassword123!" "Admin Name"
```

### Option B: Use Prisma Studio

```bash
cd api
npx prisma studio
```

Navigate to the User table and create a user with `role: ADMIN`.

## Step 5: Start Development Servers

### Terminal 1 - Client (React App)
```bash
npm run start:client
```
Runs on `http://localhost:3000`

### Terminal 2 - API (Vercel Dev Server)
```bash
cd api
vercel dev
```
Runs on `http://localhost:3001`

### Or Use Concurrently (Single Command)
```bash
npm run dev
```

## Step 6: Verify Setup

1. **Test the API**: Visit `http://localhost:3001/api/health`
2. **Test the Client**: Visit `http://localhost:3000`
3. **Login as Admin**: Use the admin credentials from seed or your created admin
4. **Test Features**:
   - Browse products
   - Add to cart
   - Create an order
   - Check admin dashboard

## Step 7: Production Deployment

### 7.1 Push to GitHub

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

### 7.2 Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install && cd client && npm install`

### 7.3 Set Environment Variables in Vercel

In Vercel Project Settings → Environment Variables, add:

**Required:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Generated secret
- `JWT_REFRESH_SECRET` - Generated secret
- `CLIENT_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
- `REACT_APP_WHATSAPP_NUMBER` - Your WhatsApp number
- `REACT_APP_API_URL` - `/api` (for same domain)

**Optional:**
- `EMAIL_SERVICE`, `SENDGRID_API_KEY`, `SMTP_*` - For email
- `CLOUDINARY_*` - For image uploads
- `SENTRY_DSN` - For error tracking
- `WHATSAPP_WEBHOOK_URL` - For WhatsApp notifications

### 7.4 Deploy

Vercel will automatically deploy on push to main, or deploy manually:

```bash
vercel --prod
```

### 7.5 Run Production Migrations

After first deployment, run migrations:

```bash
# Pull production env vars
vercel env pull .env.production

# Run migrations
cd api
npx prisma migrate deploy --schema=../prisma/schema.prisma
```

Or use Vercel's CLI:
```bash
vercel env pull
npx prisma migrate deploy
```

## Step 8: Post-Deployment Checklist

- [ ] Verify database migrations ran successfully
- [ ] Test admin login on production
- [ ] Create production admin user (don't use test credentials)
- [ ] Update `CLIENT_URL` in Vercel to production URL
- [ ] Configure email service (if using)
- [ ] Set up error tracking (Sentry)
- [ ] Test order placement
- [ ] Verify WhatsApp notifications work
- [ ] Set up database backups
- [ ] Configure custom domain (optional)

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check if database allows connections from your IP
- Ensure SSL mode is set correctly (`?sslmode=require`)

### JWT Errors

- Ensure JWT secrets are at least 32 characters
- Verify secrets match between `.env` and Vercel
- Check that cookies are being set correctly

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Verify all environment variables are set in Vercel

### Migration Errors

- Ensure database is accessible
- Check Prisma schema is up to date
- Try resetting database (⚠️ deletes all data): `npx prisma migrate reset`

## Next Steps

After successful deployment, see:
- `NEXT_STEPS.md` - For production enhancements
- `PRODUCTION_CHECKLIST.md` - For security and optimization
- `README.md` - For API documentation

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review error logs in Vercel dashboard
3. Check database logs
4. Open an issue on GitHub

---

**Happy Coding! 🚀**

