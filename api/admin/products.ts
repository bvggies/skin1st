import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'

const ProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  moneyBackGuarantee: z.boolean().optional(),
  eligibleForReturn: z.boolean().optional(),
  isAdult: z.boolean().optional(),
  // New fields
  howToUse: z.string().optional(),
  ingredients: z.string().optional(),
  pricingPackaging: z.string().optional(),
  faq: z.string().optional(),
  deliveryReturns: z.string().optional(),
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
  const prisma = await getPrisma()
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const parse = ProductSchema.safeParse(req.body || {})
  if (!parse.success) return res.status(400).json({ error: parse.error.errors })

  const { 
    name, slug, description, categoryId, brandId, 
    isNew, isBestSeller, moneyBackGuarantee, eligibleForReturn, isAdult,
    howToUse, ingredients, pricingPackaging, faq, deliveryReturns,
    images, variants 
  } = parse.data

  // Check if slug already exists
  const existing = await prisma.product.findUnique({ where: { slug } })
  if (existing) return res.status(409).json({ error: 'Product with this slug already exists' })

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      categoryId: categoryId || null,
      brandId: brandId || null,
      isNew: isNew || false,
      isBestSeller: isBestSeller || false,
      moneyBackGuarantee: moneyBackGuarantee || false,
      eligibleForReturn: eligibleForReturn !== undefined ? eligibleForReturn : true,
      isAdult: isAdult || false,
      howToUse: howToUse || null,
      ingredients: ingredients || null,
      pricingPackaging: pricingPackaging || null,
      faq: faq || null,
      deliveryReturns: deliveryReturns || null,
      images: images ? {
        create: images.map(img => ({ url: img.url, alt: img.alt || null }))
      } : undefined,
      variants: variants ? {
        create: variants.map(v => ({
          sku: v.sku,
          name: v.name,
          price: v.price,
          discount: v.discount || 0,
          stock: v.stock || 0
        }))
      } : undefined
    },
    include: {
      images: true,
      variants: true,
      category: true,
      brand: true
    }
  })

  return res.status(201).json({ product })
}

