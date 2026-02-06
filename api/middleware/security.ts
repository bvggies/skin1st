import { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Set security headers for all responses
 */
export function setSecurityHeaders(req: VercelRequest, res: VercelResponse) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for React
    "style-src 'self' 'unsafe-inline'", // Allow inline styles
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
  ].join('; ')
  res.setHeader('Content-Security-Policy', csp)
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  // Remove server information
  res.removeHeader('X-Powered-By')
}

/**
 * Set cache headers for read-heavy GET responses. Reduces Neon compute by allowing
 * edge/browser cache so the same request doesn't hit the DB every time.
 * @param res - Vercel response
 * @param maxAge - CDN cache TTL in seconds (default 60)
 * @param staleWhileRevalidate - Optional stale-while-revalidate in seconds (default 300)
 */
export function setCacheHeaders(
  res: VercelResponse,
  maxAge: number = 60,
  staleWhileRevalidate?: number
) {
  const swr = staleWhileRevalidate != null ? `, stale-while-revalidate=${staleWhileRevalidate}` : ''
  res.setHeader('Cache-Control', `public, s-maxage=${maxAge}${swr}`)
}

/**
 * CORS configuration
 */
export function configureCORS(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin
  const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean) as string[]
  
  // Allow requests from allowed origins or same origin
  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost'))) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else if (!origin) {
    // Same-origin request
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Max-Age', '86400') // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return true
  }
  
  return false
}

/**
 * Request size limit middleware
 */
export function checkRequestSize(req: VercelRequest, res: VercelResponse, maxSize: number = 1024 * 1024): boolean {
  const contentLength = req.headers['content-length']
  if (contentLength && parseInt(contentLength) > maxSize) {
    res.status(413).json({ error: 'Request entity too large' })
    return false
  }
  return true
}

/**
 * Remove debug information from responses in production
 */
export function sanitizeResponse(data: any, isProduction: boolean = process.env.NODE_ENV === 'production'): any {
  if (!isProduction) return data
  
  // Remove debug fields
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data }
    delete sanitized.debug
    delete sanitized.stack
    delete sanitized.errorDetails
    return sanitized
  }
  
  return data
}
