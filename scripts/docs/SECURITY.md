# Security Features

This document outlines the security measures implemented to protect data and prevent unauthorized access.

## 🔒 Security Headers

All API responses include security headers:
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables browser XSS protection
- **Content-Security-Policy**: Restricts resource loading
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

## 🛡️ Data Sanitization

### User Data
- Passwords are **never** returned in API responses
- Email addresses are masked for non-owners (first 2 chars + domain)
- Phone numbers are masked (first 3 + last 3 digits)
- Sensitive fields are automatically removed from responses

### Order Data
- Full order details only visible to:
  - Order owner (the user who placed it)
  - Administrators
- Public tracking shows masked information:
  - Masked phone numbers
  - Masked customer names
  - Limited address information

### Response Sanitization
- All responses are sanitized to remove:
  - Passwords
  - Tokens
  - Debug information (in production)
  - Stack traces
  - Internal error details

## 🚦 Rate Limiting

Rate limits are enforced to prevent abuse:
- **Authentication endpoints**: 5 requests per 15 minutes
- **API endpoints**: 60 requests per minute
- **Order creation**: 10 orders per minute

## 🔐 Authentication & Authorization

- JWT tokens for authentication
- Role-based access control (ADMIN, USER)
- Protected routes require valid authentication
- Admin-only endpoints check user role

## ✅ Input Validation

- All inputs are validated using Zod schemas
- String inputs are sanitized to prevent XSS
- Email and phone validation
- Request size limits (1MB default)

## 🌐 CORS Configuration

- CORS is configured for allowed origins only
- Credentials are supported for authenticated requests
- Preflight requests are handled properly

## 📝 Best Practices

1. **Never expose passwords** - Always use `sanitizeUser()` utility
2. **Mask sensitive data** - Use masking utilities for public endpoints
3. **Validate all inputs** - Use Zod schemas for validation
4. **Set security headers** - Call `setSecurityHeaders()` in all endpoints
5. **Rate limit sensitive endpoints** - Use rate limiting middleware
6. **Check authorization** - Verify user role before accessing admin data

## 🔧 Usage Examples

### Sanitize User Data
```typescript
import { sanitizeUser } from '../utils/responseSanitizer'

// For user's own data (includeSensitive = true)
const userData = sanitizeUser(user, true)

// For public/admin views (includeSensitive = false)
const publicData = sanitizeUser(user, false)
```

### Sanitize Order Data
```typescript
import { sanitizeOrder } from '../utils/responseSanitizer'

// For order owner
const orderData = sanitizeOrder(order, true, false)

// For admin
const adminOrderData = sanitizeOrder(order, false, true)

// For public
const publicOrderData = sanitizeOrder(order, false, false)
```

### Set Security Headers
```typescript
import { setSecurityHeaders } from '../middleware/security'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(req, res)
  // ... rest of handler
}
```

### Rate Limiting
```typescript
import { authRateLimit } from '../middleware/rateLimit'

if (!authRateLimit(req, res)) return
```

## 🚨 Security Checklist

- [x] Security headers on all responses
- [x] Password never exposed
- [x] User data sanitization
- [x] Order data sanitization
- [x] Rate limiting
- [x] Input validation
- [x] CORS configuration
- [x] Request size limits
- [x] Authentication middleware
- [x] Authorization checks
- [x] Data masking utilities

## 🔍 Monitoring

Monitor for:
- Failed authentication attempts
- Rate limit violations
- Unusual request patterns
- Large request sizes
- Invalid input attempts
