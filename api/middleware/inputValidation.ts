import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: VercelRequest, res: VercelResponse): { valid: boolean; data?: T; error?: any } => {
    try {
      const parse = schema.safeParse(req.body)
      if (!parse.success) {
        res.status(400).json({ 
          error: 'Validation failed',
          details: parse.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        })
        return { valid: false, error: parse.error }
      }
      return { valid: true, data: parse.data }
    } catch (error) {
      res.status(400).json({ error: 'Invalid request body' })
      return { valid: false, error }
    }
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: VercelRequest, res: VercelResponse): { valid: boolean; data?: T; error?: any } => {
    try {
      const parse = schema.safeParse(req.query)
      if (!parse.success) {
        res.status(400).json({ 
          error: 'Invalid query parameters',
          details: parse.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        })
        return { valid: false, error: parse.error }
      }
      return { valid: true, data: parse.data }
    } catch (error) {
      res.status(400).json({ error: 'Invalid query parameters' })
      return { valid: false, error }
    }
  }
}

/**
 * Sanitize and validate string input
 */
export function sanitizeInput(input: any): string {
  if (typeof input !== 'string') return ''
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '')
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  // Limit length (prevent DoS)
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000)
  }
  
  return sanitized
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate and sanitize phone number
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  // Allow international format: + followed by digits, or just digits
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}
