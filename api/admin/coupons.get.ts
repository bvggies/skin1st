import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { authGuard } from '../middleware/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' }
  })

  res.status(200).json({ coupons })
}

