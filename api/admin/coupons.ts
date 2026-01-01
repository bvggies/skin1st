import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'
import { sanitizeString } from '../utils/sanitize'

const CouponSchema = z.object({
  code: z.string().min(1),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().int().min(0),
  expiry: z.string().datetime().nullable().optional(),
  maxUses: z.number().int().min(1).nullable().optional()
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method === 'GET') {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json({ coupons })
  }

  if (req.method === 'POST') {
    const parse = CouponSchema.safeParse(req.body || {})
    if (!parse.success) return res.status(400).json({ error: parse.error.errors })

    const { code, type, value, expiry, maxUses } = parse.data

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
    if (existing) return res.status(409).json({ error: 'Coupon code already exists' })

    // Validate percentage
    if (type === 'percentage' && value > 100) {
      return res.status(400).json({ error: 'Percentage cannot exceed 100' })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: sanitizeString(code).toUpperCase(),
        type,
        value,
        expiry: expiry ? new Date(expiry) : null,
        maxUses: maxUses || null
      }
    })

    return res.status(201).json({ coupon })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

