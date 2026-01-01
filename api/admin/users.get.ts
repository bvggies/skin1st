import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { authGuard } from '../middleware/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { page = '1', pageSize = '20', q } = req.query as any
  const p = Math.max(1, Number(page) || 1)
  const ps = Math.min(100, Math.max(1, Number(pageSize) || 20)))

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

  res.status(200).json({ users, meta: { page: p, pageSize: ps, total } })
}

