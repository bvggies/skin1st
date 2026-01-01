import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'

const ImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional()
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid product id' })

  // Verify product exists
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return res.status(404).json({ error: 'Product not found' })

  if (req.method === 'POST') {
    const parse = ImageSchema.safeParse(req.body || {})
    if (!parse.success) return res.status(400).json({ error: parse.error.errors })

    const image = await prisma.productImage.create({
      data: {
        url: parse.data.url,
        alt: parse.data.alt || null,
        productId: id
      }
    })

    return res.status(201).json({ image })
  }

  if (req.method === 'DELETE') {
    const { imageId } = req.body
    if (!imageId || typeof imageId !== 'string') {
      return res.status(400).json({ error: 'imageId is required' })
    }

    await prisma.productImage.delete({
      where: { id: imageId }
    })

    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

