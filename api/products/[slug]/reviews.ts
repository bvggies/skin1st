import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../db'
import { z } from 'zod'
import { authGuard, requireAuth } from '../../middleware/auth'

const ReviewSchema = z.object({ 
  rating: z.number().min(1).max(5), 
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
    // Allow anonymous reviews; if user is logged in, attach userId
    const maybeUser = await requireAuth(req, res)

    const parse = ReviewSchema.safeParse(req.body || {})
    if (!parse.success) return res.status(400).json({ error: parse.error.errors })

    const product = await prisma.product.findUnique({ where: { slug } })
    if (!product) return res.status(404).json({ error: 'Product not found' })

    const data: any = { 
      rating: parse.data.rating, 
      title: parse.data.title || null, 
      body: parse.data.body || null, 
      productId: product.id 
    }
    if (maybeUser && maybeUser.id) data.userId = maybeUser.id

    const review = await prisma.review.create({ 
      data,
      include: { user: { select: { id: true, name: true, email: true } } }
    })
    return res.status(201).json({ review })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

