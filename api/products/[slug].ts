import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { slug } = req.query
  if (!slug || typeof slug !== 'string') return res.status(400).json({ error: 'Invalid slug' })

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true, variants: true, reviews: { include: { user: true } }, brand: true, category: true }
  })
  if (!product) return res.status(404).json({ error: 'Product not found' })
  res.status(200).json({ product })
}
