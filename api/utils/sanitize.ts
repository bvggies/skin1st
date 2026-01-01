// Input sanitization utilities

export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return ''
  return email.toLowerCase().trim()
}

export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return ''
  
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return ''
    }
    return parsed.toString()
  } catch {
    return ''
  }
}

export function sanitizeSlug(slug: string): string {
  if (typeof slug !== 'string') return ''
  
  // Only allow alphanumeric, hyphens, and underscores
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function sanitizeNumber(input: any): number {
  const num = Number(input)
  if (isNaN(num)) return 0
  return Math.max(0, Math.floor(num)) // Ensure non-negative integer
}

