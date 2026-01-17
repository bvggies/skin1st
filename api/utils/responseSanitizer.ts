// Response sanitization utilities to hide sensitive data from public

/**
 * Sanitize user object to remove sensitive information
 */
export function sanitizeUser(user: any, includeSensitive: boolean = false) {
  if (!user) return null
  
  const sanitized: any = {
    id: user.id,
    name: user.name,
    email: includeSensitive ? user.email : maskEmail(user.email),
    role: user.role,
    enabled: user.enabled,
    createdAt: user.createdAt,
  }
  
  // Only include phone if explicitly allowed and user is admin
  if (includeSensitive && user.phone) {
    sanitized.phone = user.phone
  } else if (user.phone) {
    sanitized.phone = maskPhone(user.phone)
  }
  
  // Never include password
  delete sanitized.password
  
  return sanitized
}

/**
 * Sanitize order object to remove sensitive information
 */
export function sanitizeOrder(order: any, isOwner: boolean = false, isAdmin: boolean = false) {
  if (!order) return null
  
  const sanitized: any = {
    id: order.id,
    code: order.code,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items || [],
  }
  
  // Only include sensitive data if user is owner or admin
  if (isOwner || isAdmin) {
    sanitized.customerName = order.customerName
    sanitized.phone = order.phone
    sanitized.alternativePhone = order.alternativePhone
    sanitized.email = order.user?.email
    sanitized.deliveryAddr = order.deliveryAddr
    sanitized.region = order.region
    sanitized.city = order.city
    sanitized.area = order.area
    sanitized.landmark = order.landmark
    sanitized.deliveryNotes = order.deliveryNotes
    sanitized.trackingCode = order.trackingCode
    sanitized.statusHistory = order.statusHistory
    sanitized.deliveredAt = order.deliveredAt
    sanitized.user = order.user ? sanitizeUser(order.user, isAdmin) : null
  } else {
    // Public/limited access - mask sensitive data
    sanitized.customerName = maskName(order.customerName)
    sanitized.phone = maskPhone(order.phone)
    sanitized.deliveryAddr = maskAddress(order.deliveryAddr)
    sanitized.region = order.region
    sanitized.city = order.city
    // Don't include area, landmark, deliveryNotes, trackingCode, or user data
  }
  
  return sanitized
}

/**
 * Mask email address (show only first 2 chars and domain)
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  if (local.length <= 2) return `${local}@${domain}`
  return `${local.substring(0, 2)}***@${domain}`
}

/**
 * Mask phone number (show only first 3 and last 3 digits)
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  if (phone.length <= 6) return '***'
  return `${phone.substring(0, 3)}****${phone.substring(phone.length - 3)}`
}

/**
 * Mask name (show only first letter and last letter)
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return ''
  if (name.length <= 2) return '**'
  return `${name[0]}***${name[name.length - 1]}`
}

/**
 * Mask address (show only first few chars)
 */
export function maskAddress(address: string | null | undefined): string {
  if (!address) return ''
  if (address.length <= 10) return '***'
  return `${address.substring(0, 10)}...`
}

/**
 * Remove sensitive fields from any object
 */
export function removeSensitiveFields(obj: any, fields: string[] = ['password', 'refreshToken', 'accessToken', 'token']): any {
  if (!obj || typeof obj !== 'object') return obj
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeSensitiveFields(item, fields))
  }
  
  const sanitized = { ...obj }
  fields.forEach(field => {
    delete sanitized[field]
  })
  
  // Recursively sanitize nested objects
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = removeSensitiveFields(sanitized[key], fields)
    }
  })
  
  return sanitized
}
