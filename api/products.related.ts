import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const category = req.query.category as string | undefined
  const brand = req.query.brand as string | undefined
  const where: any = { isAdult: false } // Exclude adult items from related products
  if (category) where.category = { slug: category }
  if (brand) where.brand = { slug: brand }
  const products = await prisma.product.findMany({ where, include: { images: true }, take: 8 })
  res.status(200).json({ products })
}