import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'
import { sanitizeString, sanitizeSlug } from '../utils/sanitize'

const BrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1)
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method === 'GET') {
    const brands = await prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' }
    })

    // Map to include products count
    const brandsWithCount = brands.map(brand => ({
      ...brand,
      products: Array(brand._count.products).fill(null) // For compatibility with frontend
    }))

    return res.status(200).json({ brands: brandsWithCount })
  }

  if (req.method === 'POST') {
    const parse = BrandSchema.safeParse(req.body || {})
    if (!parse.success) return res.status(400).json({ error: parse.error.errors })

    const { name, slug } = parse.data

    // Check if slug already exists
    const existing = await prisma.brand.findUnique({ where: { slug: sanitizeSlug(slug) } })
    if (existing) {
      return res.status(409).json({ error: 'Brand with this slug already exists' })
    }

    const brand = await prisma.brand.create({
      data: {
        name: sanitizeString(name),
        slug: sanitizeSlug(slug)
      }
    })

    return res.status(201).json({ brand })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

