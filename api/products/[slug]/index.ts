import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../db'
import { setCacheHeaders } from '../../middleware/security'
import { apiRateLimit } from '../../middleware/rateLimit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!apiRateLimit(req, res)) return
  const { slug } = req.query
  if (!slug || typeof slug !== 'string') return res.status(400).json({ error: 'Invalid slug' })

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { 
      images: true, 
      variants: true, 
      reviews: { 
        include: { 
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }, 
      brand: true, 
      category: true 
    }
  })
  if (!product) return res.status(404).json({ error: 'Product not found' })
  setCacheHeaders(res, 60, 300)
  res.status(200).json({ product })
}

