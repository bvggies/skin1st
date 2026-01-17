import { VercelRequest, VercelResponse } from '@vercel/node'
import { authGuard } from '../middleware/auth'
import { setSecurityHeaders } from '../middleware/security'
import { sanitizeUser } from '../utils/responseSanitizer'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(req, res)
  
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const user = await authGuard(req, res)
  if (!user) return // authGuard already sent 401
  
  // User can see their own full data (except password)
  const sanitized = sanitizeUser(user, true)
  return res.status(200).json({ user: sanitized })
}
