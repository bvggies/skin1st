import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'

const VariantSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().min(0),
  discount: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).optional()
})

const UpdateVariantSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  price: z.number().int().min(0).optional(),
  discount: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).optional()
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
    const parse = VariantSchema.safeParse(req.body || {})
    if (!parse.success) return res.status(400).json({ error: parse.error.errors })

    // Check if SKU already exists
    const existing = await prisma.variant.findUnique({ where: { sku: parse.data.sku } })
    if (existing) return res.status(409).json({ error: 'SKU already exists' })

    const variant = await prisma.variant.create({
      data: {
        sku: parse.data.sku,
        name: parse.data.name,
        price: parse.data.price,
        discount: parse.data.discount || 0,
        stock: parse.data.stock || 0,
        productId: id
      }
    })

    return res.status(201).json({ variant })
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { variantId } = req.body
    if (!variantId || typeof variantId !== 'string') {
      return res.status(400).json({ error: 'variantId is required' })
    }

    const parse = UpdateVariantSchema.safeParse(req.body || {})
    if (!parse.success) return res.status(400).json({ error: parse.error.errors })

    // Check if SKU is being updated and if it's already taken
    if (parse.data.sku) {
      const existing = await prisma.variant.findFirst({
        where: { sku: parse.data.sku, id: { not: variantId } }
      })
      if (existing) return res.status(409).json({ error: 'SKU already exists' })
    }

    const variant = await prisma.variant.update({
      where: { id: variantId },
      data: {
        ...(parse.data.sku && { sku: parse.data.sku }),
        ...(parse.data.name && { name: parse.data.name }),
        ...(parse.data.price !== undefined && { price: parse.data.price }),
        ...(parse.data.discount !== undefined && { discount: parse.data.discount }),
        ...(parse.data.stock !== undefined && { stock: parse.data.stock })
      }
    })

    return res.status(200).json({ variant })
  }

  if (req.method === 'DELETE') {
    const { variantId } = req.body
    if (!variantId || typeof variantId !== 'string') {
      return res.status(400).json({ error: 'variantId is required' })
    }

    await prisma.variant.delete({ where: { id: variantId } })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

