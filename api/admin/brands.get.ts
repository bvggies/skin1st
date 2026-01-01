import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { authGuard } from '../middleware/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const brands = await prisma.brand.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Map to include products count
  const brandsWithCount = brands.map(brand => ({
    ...brand,
    products: Array(brand._count.products).fill(null) // For compatibility with frontend
  }))

  res.status(200).json({ brands: brandsWithCount })
}

