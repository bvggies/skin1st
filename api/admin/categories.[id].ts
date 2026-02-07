import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'
import { sanitizeString, sanitizeSlug } from '../utils/sanitize'

const UpdateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional()
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' })

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const parse = UpdateCategorySchema.safeParse(req.body || {})
    if (!parse.success) return res.status(400).json({ error: parse.error.errors })

    // Check if slug is being updated and if it's already taken
    if (parse.data.slug) {
      const existing = await prisma.category.findFirst({
        where: { slug: sanitizeSlug(parse.data.slug), id: { not: id } }
      })
      if (existing) return res.status(409).json({ error: 'Slug already exists' })
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(parse.data.name && { name: sanitizeString(parse.data.name) }),
        ...(parse.data.slug && { slug: sanitizeSlug(parse.data.slug) })
      }
    })

    return res.status(200).json({ category })
  }

  if (req.method === 'DELETE') {
    // Check if category has products
    const productsCount = await prisma.product.count({ where: { categoryId: id } })
    if (productsCount > 0) {
      return res.status(400).json({ error: 'Cannot delete category with products. Please remove products first.' })
    }

    await prisma.category.delete({ where: { id } })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

