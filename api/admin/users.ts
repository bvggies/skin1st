import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from '../db'
import { authGuard } from '../middleware/auth'
import { setSecurityHeaders } from '../middleware/security'
import { sanitizeUser } from '../utils/responseSanitizer'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  setSecurityHeaders(req, res)
  
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { page = '1', pageSize = '20', q } = req.query as any
  const p = Math.max(1, Number(page) || 1)
  const ps = Math.min(100, Math.max(1, Number(pageSize) || 20))

  const where: any = {}
  if (q) {
    where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } }
    ]
  }

  const total = await prisma.user.count({ where })
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      enabled: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    skip: (p - 1) * ps,
    take: ps
  })

  // Sanitize user data - admins can see full data but still remove password
  const sanitizedUsers = users.map(u => sanitizeUser(u, true))

  res.status(200).json({ users: sanitizedUsers, meta: { page: p, pageSize: ps, total } })
}

