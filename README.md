# Skin1st Beauty Therapy — E-Commerce Platform

A complete, production-ready e-commerce platform for beauty and skin therapy products. Built with React, TypeScript, Node.js, PostgreSQL, and deployed on Vercel.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse products with search, filtering, and pagination
- **Shopping Cart**: Guest and authenticated cart support with cart merging
- **Order Management**: Place orders (COD), track status, view history
- **User Authentication**: Secure JWT-based auth with refresh tokens
- **Wishlist**: Save favorite products
- **Reviews & Ratings**: Product reviews with ratings
- **Profile Management**: Update profile and change password
- **Order Tracking**: Real-time order status updates
- **Money-Back Guarantee**: Claim system for refunds
- **Newsletter**: Email subscription
- **Recently Viewed**: Track recently viewed products

### Admin Features
- **Dashboard**: Analytics and overview
- **Product Management**: Full CRUD for products, variants, and images
- **Order Management**: View, update status, and manage orders
- **User Management**: View and manage users
- **Category & Brand Management**: Organize products
- **Coupon System**: Create and manage discount coupons
- **Guarantee Claims**: Process money-back guarantee claims
- **Analytics**: Sales reports and insights

### Technical Features
- **Security**: Rate limiting, input sanitization, JWT authentication
- **Notifications**: Email and WhatsApp notifications
- **Responsive Design**: Mobile-first, modern UI with Tailwind CSS
- **Performance**: Optimized with React Query, lazy loading
- **SEO**: Meta tags and structured data ready

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon, Supabase, or any PostgreSQL provider)
- Vercel account (for deployment)
- GitHub account

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/bvggies/skin1st.git
cd skin1st
```

### 2. Install Dependencies

```bash
npm install
cd client && npm install && cd ..
cd api && npm install && cd ..
```

### 3. Database Setup

1. Create a PostgreSQL database (recommended: [Neon](https://neon.tech) or [Supabase](https://supabase.com))
2. Copy the connection string (DATABASE_URL)
3. Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
CLIENT_URL="http://localhost:3000"
EMAIL_HOST="smtp.example.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-email-password"
EMAIL_FROM="noreply@skin1st.com"
REACT_APP_WHATSAPP_NUMBER="+1234567890"
```

### 4. Run Database Migrations

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

### 5. Seed Initial Data

```bash
npm run prisma:seed
```

### 6. Create Admin User

```bash
node prisma/scripts/create-admin.js
```

### 7. Start Development Servers

**Terminal 1 - Client:**
```bash
cd client
npm start
```

**Terminal 2 - API (for local testing):**
```bash
cd api
vercel dev
```

The client will run on `http://localhost:3000` and the API on `http://localhost:3001`.

## 🚀 Deployment to Vercel

### 1. Push to GitHub

The code is already pushed to: `https://github.com/bvggies/skin1st`

### 2. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import the GitHub repository: `bvggies/skin1st`
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 3. Configure Environment Variables

In Vercel project settings, add all environment variables from your `.env` file:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_URL` (your Vercel deployment URL)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
- `REACT_APP_WHATSAPP_NUMBER`

### 4. Configure Vercel Build Settings

The `vercel.json` file is already configured to:
- Route `/api/*` to serverless functions in the `api` directory
- Handle client-side routing

### 5. Deploy

Vercel will automatically deploy on every push to the `main` branch.

### 6. Run Database Migrations in Production

After first deployment, run migrations:

```bash
npx prisma migrate deploy
```

Or use Vercel's CLI:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

## 📁 Project Structure

```
skin1st/
├── api/                    # Backend API (Vercel serverless functions)
│   ├── admin/              # Admin endpoints
│   ├── middleware/         # Auth, rate limiting
│   ├── utils/              # Email, notifications, sanitization
│   └── *.ts                 # API route handlers
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context (Auth)
│   │   ├── store/          # Zustand stores (Cart)
│   │   └── api/            # API client
│   └── public/
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma       # Prisma schema
│   ├── migrations/         # Database migrations
│   └── seed.js             # Seed script
├── vercel.json             # Vercel configuration
└── package.json            # Root package.json (workspaces)
```

## 🔐 Security Features

- JWT authentication with HttpOnly cookies
- Rate limiting on sensitive endpoints
- Input sanitization to prevent XSS
- Password hashing with bcrypt
- Role-based access control (ADMIN/CUSTOMER)
- CORS configuration
- Secure environment variables

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/[slug]` - Get product details
- `GET /api/products/related` - Get related products

### Cart
- `GET /api/cart` - Get cart
- `PUT /api/cart` - Update cart
- `POST /api/cart/merge` - Merge guest cart with user cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my` - Get user orders
- `GET /api/orders/track` - Track order by code
- `GET /api/orders/[id]/invoice` - Download invoice

### Admin (requires ADMIN role)
- `GET /api/admin/orders` - List all orders
- `PUT /api/admin/orders/[id]/status` - Update order status
- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- And more...

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test API endpoints
npm run test:api
```

## 📦 Scripts

```bash
# Database
npm run prisma:generate      # Generate Prisma client
npm run prisma:migrate:dev   # Run migrations (dev)
npm run prisma:migrate:deploy # Deploy migrations (prod)
npm run prisma:seed          # Seed database

# Development
npm run dev                  # Start dev servers
cd client && npm start       # Start React app
cd api && vercel dev         # Start API locally

# Build
cd client && npm run build   # Build React app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary. All rights reserved.

## 🆘 Support

For support, email support@skin1st.com or open an issue on GitHub.

## 🎯 Roadmap

- [ ] Payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Inventory management
- [ ] Shipping integration
- [ ] Advanced search with filters
- [ ] Product recommendations (AI)

---

**Built with ❤️ for Skin1st Beauty Therapy**

