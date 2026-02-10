/**
 * Safely extract error message from various error formats.
 * Handles: strings, objects with message/code, arrays, Zod errors, etc.
 */
export function getErrorMessage(error: any, fallback = 'An error occurred'): string {
  if (!error) return fallback
  
  // String error
  if (typeof error === 'string') return error
  
  // Axios response error
  if (error?.response?.data?.error) {
    const err = error.response.data.error
    if (typeof err === 'string') return err
    if (err?.message && typeof err.message === 'string') return err.message
    if (Array.isArray(err) && err.length > 0) {
      const first = err[0]
      if (typeof first === 'string') return first
      if (first?.message && typeof first.message === 'string') return first.message
    }
  }
  
  // Error object with message
  if (error?.message && typeof error.message === 'string') return error.message
  
  // Error object with code (Prisma errors, etc.)
  if (error?.code && typeof error.code === 'string') {
    return `Error: ${error.code}${error.meta ? ` (${JSON.stringify(error.meta)})` : ''}`
  }
  
  // Array of errors
  if (Array.isArray(error) && error.length > 0) {
    return getErrorMessage(error[0], fallback)
  }
  
  return fallback
}
