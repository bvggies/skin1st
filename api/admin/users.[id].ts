import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'CUSTOMER']).optional(),
  enabled: z.boolean().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' })

  if (req.method === 'GET') {
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        enabled: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true }
        }
      }
    })
    if (!targetUser) return res.status(404).json({ error: 'User not found' })
    return res.status(200).json({ user: targetUser })
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    const parse = UpdateUserSchema.safeParse(req.body || {})
    if (!parse.success) return res.status(400).json({ error: parse.error.errors })

    // Prevent admins from disabling themselves
    if (id === user.id && parse.data.enabled === false) {
      return res.status(400).json({ error: 'You cannot disable your own account' })
    }

    // Prevent admins from removing their own admin role
    if (id === user.id && parse.data.role === 'CUSTOMER') {
      return res.status(400).json({ error: 'You cannot remove your own admin privileges' })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(parse.data.name !== undefined && { name: parse.data.name }),
        ...(parse.data.phone !== undefined && { phone: parse.data.phone }),
        ...(parse.data.role !== undefined && { role: parse.data.role }),
        ...(parse.data.enabled !== undefined && { enabled: parse.data.enabled }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        enabled: true,
        createdAt: true,
      }
    })

    return res.status(200).json({ user: updatedUser })
  }

  if (req.method === 'DELETE') {
    // Check if trying to delete self
    if (id === user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' })
    }

    // Delete related data first
    await prisma.refreshToken.deleteMany({ where: { userId: id } })
    await prisma.wishlist.deleteMany({ where: { userId: id } })
    await prisma.review.deleteMany({ where: { userId: id } })
    await prisma.cart.deleteMany({ where: { userId: id } })
    // Note: Orders are kept for records but user reference is nulled
    await prisma.order.updateMany({
      where: { userId: id },
      data: { userId: null }
    })
    await prisma.user.delete({ where: { id } })
    
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

