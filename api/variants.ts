import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './db'
import { setCacheHeaders } from './middleware/security'
import { apiRateLimit } from './middleware/rateLimit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!apiRateLimit(req, res)) return
  const idsParam = req.query.ids as string | undefined
  if (!idsParam) return res.status(400).json({ error: 'ids query is required' })
  const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean)
  const variants = await prisma.variant.findMany({ where: { id: { in: ids } }, include: { product: true } })
  setCacheHeaders(res, 60, 300)
  res.status(200).json({ variants })
}
