import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const category = req.query.category as string | undefined
  const brand = req.query.brand as string | undefined
  
  // Build where conditions
  const whereConditions: any[] = [
    { isAdult: false },
    { category: { slug: { not: 'adult-products' } } }
  ]
  
  if (category) {
    whereConditions.push({ category: { slug: category } })
  }
  if (brand) {
    whereConditions.push({ brand: { slug: brand } })
  }
  
  // Exclude adult items from related products (both isAdult=true and adult-products category)
  const where = { AND: whereConditions }
  
  const products = await prisma.product.findMany({ where, include: { images: true }, take: 8 })
  res.status(200).json({ products })
}