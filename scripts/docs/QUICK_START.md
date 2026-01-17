# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites
- Node.js 18+
- PostgreSQL database (get free one at [Neon](https://neon.tech) or [Supabase](https://supabase.com))

## Steps

### 1. Install Dependencies
```bash
npm install
cd client && npm install && cd ..
cd api && npm install && cd ..
```

### 2. Setup Environment
```bash
# Interactive setup (recommended)
npm run setup:env

# OR manually copy template
cp env.template .env
# Then edit .env with your database URL and WhatsApp number
```

### 3. Setup Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# Seed sample data
npm run prisma:seed
```

### 4. Create Admin User
```bash
npm run prisma:create-admin admin@yourstore.com "YourPassword123!"
```

### 5. Start Development
```bash
# Terminal 1: Client
npm run start:client

# Terminal 2: API
cd api && vercel dev
```

Visit `http://localhost:3000` and login with your admin credentials!

## Default Test Users (from seed)

- **Admin**: `admin@skin1st.test` / `AdminPass123!`
- **Customer**: `jane@doe.test` / `CustomerPass123!`

⚠️ **Change these passwords immediately in production!**

## Next Steps

- See `SETUP_GUIDE.md` for detailed setup instructions
- See `NEXT_STEPS.md` for production deployment
- See `PRODUCTION_CHECKLIST.md` for security enhancements

---

**Need help?** Check `SETUP_GUIDE.md` for troubleshooting and detailed instructions.

