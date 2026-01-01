// Simple logging utility
// In production, integrate with Sentry, LogRocket, or similar

interface LogLevel {
  ERROR: 'error'
  WARN: 'warn'
  INFO: 'info'
  DEBUG: 'debug'
}

export function logError(error: Error | any, context?: Record<string, any>) {
  const errorInfo = {
    message: error?.message || String(error),
    stack: error?.stack,
    context,
    timestamp: new Date().toISOString()
  }

  console.error('ERROR:', errorInfo)

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    // Example Sentry integration (uncomment and install @sentry/node)
    /*
    const Sentry = require('@sentry/node')
    Sentry.captureException(error, {
      extra: context
    })
    */
  }

  return errorInfo
}

export function logInfo(message: string, data?: any) {
  console.log('INFO:', { message, data, timestamp: new Date().toISOString() })
}

export function logWarn(message: string, data?: any) {
  console.warn('WARN:', { message, data, timestamp: new Date().toISOString() })
}

// Request logging middleware
export function logRequest(req: any, res: any, next?: () => void) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    logInfo('Request', {
      method: req.method,
      path: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
    })
  })

  if (next) next()
}

