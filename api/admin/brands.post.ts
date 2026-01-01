import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'
import { sanitizeString, sanitizeSlug } from '../utils/sanitize'

const BrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1)
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const parse = BrandSchema.safeParse(req.body || {})
  if (!parse.success) return res.status(400).json({ error: parse.error.errors })

  const { name, slug } = parse.data

  // Check if slug already exists
  const existing = await prisma.brand.findUnique({ where: { slug: sanitizeSlug(slug) } })
  if (existing) return res.status(409).json({ error: 'Brand with this slug already exists' })

  const brand = await prisma.brand.create({
    data: {
      name: sanitizeString(name),
      slug: sanitizeSlug(slug)
    }
  })

  return res.status(201).json({ brand })
}

