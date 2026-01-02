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
  moneyBackGuarantee: z.boolean().optional(),
  eligibleForReturn: z.boolean().optional(),
  // New fields
  howToUse: z.string().nullable().optional(),
  ingredients: z.string().nullable().optional(),
  pricingPackaging: z.string().nullable().optional(),
  faq: z.string().nullable().optional(),
  deliveryReturns: z.string().nullable().optional(),
  // Allow updating images and variants
  images: z.array(z.object({ url: z.string(), alt: z.string().optional() })).optional(),
  variants: z.array(z.object({
    sku: z.string(),
    name: z.string(),
    price: z.number().int().min(0),
    discount: z.number().int().min(0).optional(),
    stock: z.number().int().min(0).optional()
  })).optional()
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

    // Build update data
    const updateData: any = {}
    
    if (parse.data.name !== undefined) updateData.name = parse.data.name
    if (parse.data.slug !== undefined) updateData.slug = parse.data.slug
    if (parse.data.description !== undefined) updateData.description = parse.data.description
    if (parse.data.categoryId !== undefined) updateData.categoryId = parse.data.categoryId
    if (parse.data.brandId !== undefined) updateData.brandId = parse.data.brandId
    if (parse.data.isNew !== undefined) updateData.isNew = parse.data.isNew
    if (parse.data.isBestSeller !== undefined) updateData.isBestSeller = parse.data.isBestSeller
    if (parse.data.moneyBackGuarantee !== undefined) updateData.moneyBackGuarantee = parse.data.moneyBackGuarantee
    if (parse.data.eligibleForReturn !== undefined) updateData.eligibleForReturn = parse.data.eligibleForReturn
    if (parse.data.howToUse !== undefined) updateData.howToUse = parse.data.howToUse
    if (parse.data.ingredients !== undefined) updateData.ingredients = parse.data.ingredients
    if (parse.data.pricingPackaging !== undefined) updateData.pricingPackaging = parse.data.pricingPackaging
    if (parse.data.faq !== undefined) updateData.faq = parse.data.faq
    if (parse.data.deliveryReturns !== undefined) updateData.deliveryReturns = parse.data.deliveryReturns

    // Handle images update - delete existing and create new
    if (parse.data.images) {
      await prisma.productImage.deleteMany({ where: { productId: id } })
      updateData.images = {
        create: parse.data.images.map(img => ({ url: img.url, alt: img.alt || null }))
      }
    }

    // Handle variants update - delete existing and create new
    if (parse.data.variants) {
      // First check for SKU conflicts with other products
      const skus = parse.data.variants.map(v => v.sku)
      const existingSkus = await prisma.variant.findMany({
        where: { 
          sku: { in: skus },
          productId: { not: id }
        }
      })
      if (existingSkus.length > 0) {
        return res.status(409).json({ 
          error: `SKU already exists: ${existingSkus.map(v => v.sku).join(', ')}` 
        })
      }

      await prisma.variant.deleteMany({ where: { productId: id } })
      updateData.variants = {
        create: parse.data.variants.map(v => ({
          sku: v.sku,
          name: v.name,
          price: v.price,
          discount: v.discount || 0,
          stock: v.stock || 0
        }))
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
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
    // Delete related data first
    await prisma.productImage.deleteMany({ where: { productId: id } })
    await prisma.variant.deleteMany({ where: { productId: id } })
    await prisma.review.deleteMany({ where: { productId: id } })
    await prisma.wishlist.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
