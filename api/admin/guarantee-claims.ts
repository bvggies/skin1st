import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { authGuard } from '../middleware/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { page = '1', pageSize = '20', status } = req.query as any
  const p = Math.max(1, Number(page) || 1)
  const ps = Math.min(100, Math.max(1, Number(pageSize) || 20))

  const where: any = {}
  if (status) where.status = status

  const total = await prisma.guaranteeClaim.count({ where })
  const claims = await prisma.guaranteeClaim.findMany({
    where,
    include: {
      order: {
        include: {
          user: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: (p - 1) * ps,
    take: ps
  })

  res.status(200).json({ claims, meta: { page: p, pageSize: ps, total } })
}

