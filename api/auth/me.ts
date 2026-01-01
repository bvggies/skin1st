import { VercelRequest, VercelResponse } from '@vercel/node'
import { authGuard } from '../middleware/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const user = await authGuard(req, res)
  if (!user) return // authGuard already sent 401
  return res.status(200).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
}
