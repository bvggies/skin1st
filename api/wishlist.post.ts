import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './db'
import { authGuard } from './middleware/auth'
import { z } from 'zod'

const WishlistSchema = z.object({
  productId: z.string().min(1)
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const parse = WishlistSchema.safeParse(req.body || {})
  if (!parse.success) return res.status(400).json({ error: parse.error.errors })

  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id: parse.data.productId } })
  if (!product) return res.status(404).json({ error: 'Product not found' })

  // Check if already in wishlist
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId: parse.data.productId
      }
    }
  })

  if (existing) {
    return res.status(200).json({ message: 'Product already in wishlist', item: existing })
  }

  const item = await prisma.wishlist.create({
    data: {
      userId: user.id,
      productId: parse.data.productId
    },
    include: {
      product: {
        include: {
          images: true,
          variants: true,
          brand: true,
          category: true
        }
      }
    }
  })

  return res.status(201).json({ item })
}

