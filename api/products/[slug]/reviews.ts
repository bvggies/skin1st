import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../db'
import { authGuard } from '../../middleware/auth'
import { z } from 'zod'

const ReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().optional()
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query
  if (!slug || typeof slug !== 'string') return res.status(400).json({ error: 'Invalid slug' })

  if (req.method === 'GET') {
    const reviews = await prisma.review.findMany({
      where: { product: { slug } },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json({ reviews })
  }

  if (req.method === 'POST') {
    const user = await authGuard(req, res)
    if (!user) return

    const parse = ReviewSchema.safeParse(req.body || {})
    if (!parse.success) return res.status(400).json({ error: parse.error.errors })

    const product = await prisma.product.findUnique({ where: { slug } })
    if (!product) return res.status(404).json({ error: 'Product not found' })

    // Check if user already reviewed this product
    const existing = await prisma.review.findFirst({
      where: { productId: product.id, userId: user.id }
    })
    if (existing) return res.status(409).json({ error: 'You have already reviewed this product' })

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: user.id,
        rating: parse.data.rating,
        title: parse.data.title || null,
        body: parse.data.body || null
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    })

    return res.status(201).json({ review })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

