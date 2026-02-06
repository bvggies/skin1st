import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './db'
import { setSecurityHeaders, setCacheHeaders } from './middleware/security'
import { apiRateLimit } from './middleware/rateLimit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(req, res)
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!apiRateLimit(req, res)) return

  // Check if this is a single product request (slug in query)
  const slug = req.query.slug as string | undefined
  
  if (slug && slug !== 'related') {
    
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { 
        images: true, 
        variants: true, 
        reviews: { 
          include: { 
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }, 
        brand: true, 
        category: true 
      }
    })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    setCacheHeaders(res, 60, 300)
    return res.status(200).json({ product })
  }

  // Otherwise, return product list
  const page = Math.max(1, parseInt((req.query.page as string) || '1'))
  const perPage = Math.min(100, Math.max(1, parseInt((req.query.perPage as string) || '12')))
  const category = req.query.category as string | undefined
  const brand = req.query.brand as string | undefined
  const search = req.query.search as string | undefined
  const sort = req.query.sort as string | undefined
  const adultParam = req.query.adult as string | undefined

  // Build where clause step by step
  const whereConditions: any[] = []
  
  // Handle category filter
  if (category) {
    whereConditions.push({ category: { slug: category } })
  }
  
  // Handle brand filter
  if (brand) {
    whereConditions.push({ brand: { slug: brand } })
  }
  
  // Handle search filter
  if (search) {
    whereConditions.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    })
  }
  
  // Filter adult items: only filter if adult parameter is explicitly set
  // IMPORTANT: When adult=false, exclude products from adult-products category AND products with isAdult=true
  // This ensures that products in the adult-products category never appear on homepage or main shop
  // When adult=true, show products that are adult (either flagged as adult OR in adult-products category)
  if (adultParam === 'true') {
    // Show products that are adult (either flagged as adult OR in adult-products category)
    whereConditions.push({
      OR: [
        { isAdult: true },
        { category: { slug: 'adult-products' } }
      ]
    })
  } else if (adultParam === 'false') {
    // Exclude products that are adult (either flagged as adult OR in adult-products category)
    whereConditions.push({ isAdult: false })
    whereConditions.push({ category: { slug: { not: 'adult-products' } } })
  }
  // If adult param is not set, don't filter by isAdult (show all products - useful for admin)
  
  // Combine all conditions with AND
  const where = whereConditions.length > 0 ? { AND: whereConditions } : {}

  // Order by updatedAt desc so new products and recently updated products appear first
  const orderBy: any = { updatedAt: 'desc' }
  if (sort === 'price_asc') orderBy['variants'] = { _min: { price: 'asc' } }
  if (sort === 'price_desc') orderBy['variants'] = { _max: { price: 'desc' } }

  // Only get products that have variants (can be purchased)
  const whereWithVariants = {
    ...where,
    variants: {
      some: {} // At least one variant exists
    }
  }

  const total = await prisma.product.count({ where: whereWithVariants })
  const products = await prisma.product.findMany({
    where: whereWithVariants,
    include: { images: true, variants: true, brand: true, category: true },
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy
  })

  setCacheHeaders(res, 60, 300)
  res.status(200).json({ products, meta: { total, page, perPage } })
}
