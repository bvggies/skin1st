# Debugging: Products Not Showing

## Quick Checks

### 1. Verify Products Are in Database

Run the seed script to ensure products exist:

```bash
cd api
node ../prisma/seed.js
```

This should output: `✅ Seeding completed! Created 10 products.`

### 2. Check Browser Console

Open your browser's Developer Tools (F12) and check:
- **Console tab**: Look for any API errors
- **Network tab**: Check if `/api/products` requests are:
  - Being made
  - Returning 200 status
  - Returning data

### 3. Test API Endpoint Directly

In your browser console or using curl:

```bash
# If running locally
curl http://localhost:3000/api/products

# Or in browser console
fetch('/api/products').then(r => r.json()).then(console.log)
```

### 4. Check Environment Variables

Make sure `REACT_APP_API_URL` is set correctly:
- Local dev: Should be `/api` (relative)
- Production: Should be your full API URL

### 5. Check Vercel Routing

If deployed on Vercel, verify:
- `vercel.json` routes are correct
- API endpoints are accessible at `/api/products`
- No CORS issues

## Common Issues

### Issue: Products exist but not showing
**Solution**: Check if products have `isBestSeller` or `isNew` flags set. The Featured Products section should show all products regardless.

### Issue: API returns 404
**Solution**: 
- Check `vercel.json` routing
- Verify API file exists at `api/products.get.ts`
- Check Vercel deployment logs

### Issue: API returns empty array
**Solution**:
- Run seed script: `cd api && node ../prisma/seed.js`
- Check database connection in `.env`
- Verify DATABASE_URL is correct

### Issue: CORS errors
**Solution**:
- Check if API and client are on same domain
- Verify `REACT_APP_API_URL` is set correctly
- Check Vercel CORS settings

## Testing Steps

1. **Check Database**:
   ```bash
   # Using Prisma Studio
   npx prisma studio
   # Navigate to Product table and verify products exist
   ```

2. **Test API Locally**:
   ```bash
   cd api
   vercel dev
   # Then test: curl http://localhost:3000/api/products
   ```

3. **Check Frontend**:
   ```bash
   cd client
   npm start
   # Open browser console and check for errors
   ```

## Expected Behavior

- **Home Page**: Should show Featured Products (all products), Best Sellers (if any), and New Arrivals (if any)
- **Shop Page**: Should show all products with pagination
- **If no products**: Should show "No products found" message

