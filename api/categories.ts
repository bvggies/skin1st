import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from './db'
import { setCacheHeaders } from './middleware/security'
import { apiRateLimit } from './middleware/rateLimit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!apiRateLimit(req, res)) return
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  setCacheHeaders(res, 120, 300)
  res.status(200).json({ categories })
}
