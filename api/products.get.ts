import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const page = Math.max(1, parseInt((req.query.page as string) || '1'))
  const perPage = Math.min(100, Math.max(1, parseInt((req.query.perPage as string) || '12')))
  const category = req.query.category as string | undefined
  const brand = req.query.brand as string | undefined
  const search = req.query.search as string | undefined
  const sort = req.query.sort as string | undefined

  const where: any = {}
  if (category) where.category = { slug: category }
  if (brand) where.brand = { slug: brand }
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }]

  const orderBy: any = { createdAt: 'desc' }
  if (sort === 'price_asc') orderBy['variants'] = { _min: { price: 'asc' } }
  if (sort === 'price_desc') orderBy['variants'] = { _max: { price: 'desc' } }

  const total = await prisma.product.count({ where })
  const products = await prisma.product.findMany({
    where,
    include: { images: true, variants: true, brand: true, category: true },
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy
  })

  res.status(200).json({ products, meta: { total, page, perPage } })
}
