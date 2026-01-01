import { VercelRequest, VercelResponse } from '@vercel/node'

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  max: number // Max requests per window
  message?: string
}

export function createRateLimiter(windowMs: number, max: number) {
  return (req: VercelRequest, res: VercelResponse): boolean => {
    const identifier = req.headers['x-forwarded-for'] || 
                      req.headers['x-real-ip'] || 
                      req.connection?.remoteAddress || 
                      'unknown'
    const key = String(identifier)
    const now = Date.now()

    const record = rateLimitMap.get(key)
    
    if (!record || record.resetTime < now) {
      // Create new record
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return true
    }

    if (record.count >= max) {
      res.status(429).json({ 
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      })
      return false
    }

    record.count++
    return true
  }
}

// Pre-configured rate limiters
export const authRateLimit = createRateLimiter(15 * 60 * 1000, 5) // 5 requests per 15 minutes
export const apiRateLimit = createRateLimiter(60 * 1000, 60) // 60 requests per minute
export const orderRateLimit = createRateLimiter(60 * 1000, 10) // 10 orders per minute

