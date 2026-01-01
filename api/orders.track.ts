import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { code, phone } = req.query
  if (!code || typeof code !== 'string') return res.status(400).json({ error: 'code required' })

  const order = await prisma.order.findUnique({ where: { code }, include: { items: { include: { variant: true } } } })
  if (!order) return res.status(404).json({ error: 'Order not found' })
  // optionally verify phone if provided
  if (phone && typeof phone === 'string' && order.userId) {
    const user = await prisma.user.findUnique({ where: { id: order.userId } })
    if (!user || user.phone !== phone) return res.status(403).json({ error: 'Invalid phone' })
  }

  res.status(200).json({ order })
}
