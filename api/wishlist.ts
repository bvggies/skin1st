import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from './db'
import { authGuard } from './middleware/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  const user = await authGuard(req, res)
  if (!user) return

  if (req.method === 'GET') {
    const items = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            images: true,
            variants: true,
            brand: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({ items })
  }

  if (req.method === 'POST') {
    const { productId } = req.body || {}
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId
        }
      }
    })

    if (existing) {
      return res.status(200).json({ message: 'Product already in wishlist', item: existing })
    }

    const item = await prisma.wishlist.create({
      data: {
        userId: user.id,
        productId
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

  return res.status(405).json({ error: 'Method not allowed' })
}

