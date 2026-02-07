import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { getPrisma } from './db'
import { requireAuth } from './middleware/auth'

const ClaimSchema = z.object({
  orderCode: z.string().min(1),
  reason: z.string().min(10)
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const parse = ClaimSchema.safeParse(req.body || {})
  if (!parse.success) return res.status(400).json({ error: parse.error.errors })

  const { orderCode, reason } = parse.data

  // Find order by code
  const order = await prisma.order.findUnique({ where: { code: orderCode.toUpperCase() } })
  if (!order) return res.status(404).json({ error: 'Order not found' })

  // Optional: verify user owns the order if authenticated
  const user = await requireAuth(req, res)
  if (user && order.userId && order.userId !== user.id) {
    return res.status(403).json({ error: 'This order does not belong to you' })
  }

  // Check if order is eligible (delivered, paid, or completed)
  const eligibleStatuses = ['DELIVERED', 'PAID', 'COMPLETED']
  if (!eligibleStatuses.includes(order.status)) {
    return res.status(400).json({ 
      error: `Order must be ${eligibleStatuses.join(', ')} to file a guarantee claim` 
    })
  }

  // Check if claim already exists
  const existingClaim = await prisma.guaranteeClaim.findFirst({
    where: { orderId: order.id, status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'] } }
  })
  if (existingClaim) {
    return res.status(400).json({ error: 'A guarantee claim already exists for this order' })
  }

  // Create claim
  const claim = await prisma.guaranteeClaim.create({
    data: {
      orderId: order.id,
      reason,
      status: 'SUBMITTED'
    }
  })

  // Track event
  await prisma.eventTracking.create({
    data: {
      type: 'GUARANTEE_CLAIM_SUBMITTED',
      payload: { claimId: claim.id, orderCode: order.code },
      orderId: order.id
    }
  })

  return res.status(201).json({ 
    claim: {
      id: claim.id,
      status: claim.status,
      orderCode: order.code
    }
  })
}

