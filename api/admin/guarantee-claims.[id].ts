import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'

const UpdateStatusSchema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REFUNDED'])
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' })

  if (req.method === 'GET') {
    const claim = await prisma.guaranteeClaim.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: {
                variant: true
              }
            }
          }
        }
      }
    })
    if (!claim) return res.status(404).json({ error: 'Claim not found' })
    return res.status(200).json({ claim })
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    const parse = UpdateStatusSchema.safeParse(req.body || {})
    if (!parse.success) return res.status(400).json({ error: parse.error.errors })

    const claim = await prisma.guaranteeClaim.findUnique({ where: { id }, include: { order: true } })
    if (!claim) return res.status(404).json({ error: 'Claim not found' })

    const updated = await prisma.guaranteeClaim.update({
      where: { id },
      data: { status: parse.data.status }
    })

    // Track event
    await prisma.eventTracking.create({
      data: {
        type: 'GUARANTEE_CLAIM_STATUS_CHANGED',
        payload: {
          claimId: id,
          from: claim.status,
          to: parse.data.status,
          adminId: user.id
        },
        orderId: claim.orderId
      }
    })

    return res.status(200).json({ claim: updated })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

