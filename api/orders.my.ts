import { VercelRequest, VercelResponse } from '@vercel/node'
import { authGuard } from './middleware/auth'
import prisma from './db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const user = await authGuard(req, res)
  if (!user) return

  const orders = await prisma.order.findMany({ where: { userId: user.id }, include: { items: { include: { variant: true } } }, orderBy: { createdAt: 'desc' } })
  res.status(200).json({ orders })
}
