import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'

const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  categoryId: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  moneyBackGuarantee: z.boolean().optional()
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' })

  if (req.method === 'GET') {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
        reviews: true
      }
    })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    return res.status(200).json({ product })
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const parse = UpdateProductSchema.safeParse(req.body || {})
    if (!parse.success) return res.status(400).json({ error: parse.error.errors })

    // Check if slug is being updated and if it's already taken
    if (parse.data.slug) {
      const existing = await prisma.product.findFirst({
        where: { slug: parse.data.slug, id: { not: id } }
      })
      if (existing) return res.status(409).json({ error: 'Slug already exists' })
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(parse.data.name && { name: parse.data.name }),
        ...(parse.data.slug && { slug: parse.data.slug }),
        ...(parse.data.description && { description: parse.data.description }),
        ...(parse.data.categoryId !== undefined && { categoryId: parse.data.categoryId }),
        ...(parse.data.brandId !== undefined && { brandId: parse.data.brandId }),
        ...(parse.data.isNew !== undefined && { isNew: parse.data.isNew }),
        ...(parse.data.isBestSeller !== undefined && { isBestSeller: parse.data.isBestSeller }),
        ...(parse.data.moneyBackGuarantee !== undefined && { moneyBackGuarantee: parse.data.moneyBackGuarantee })
      },
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true
      }
    })

    return res.status(200).json({ product })
  }

  if (req.method === 'DELETE') {
    await prisma.product.delete({ where: { id } })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

