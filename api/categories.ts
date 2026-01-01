import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  res.status(200).json({ categories })
}
