import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../db'
import { authGuard } from '../middleware/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' })

  const order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { variant: true } }, user: true } })
  if (!order) return res.status(404).json({ error: 'Order not found' })

  const events = await prisma.eventTracking.findMany({ where: { orderId: id }, orderBy: { createdAt: 'desc' } })

  res.status(200).json({ order, events })
}