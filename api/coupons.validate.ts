import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from './db'
import { apiRateLimit } from './middleware/rateLimit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!apiRateLimit(req, res)) return

  const { code, total } = req.body
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Coupon code is required' })
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid coupon code' })
  }

  // Check expiry
  if (coupon.expiry && new Date() > coupon.expiry) {
    return res.status(400).json({ error: 'Coupon has expired' })
  }

  // Calculate discount
  let discount = 0
  if (coupon.type === 'percentage') {
    discount = Math.floor((total || 0) * (coupon.value / 100))
  } else if (coupon.type === 'fixed') {
    discount = coupon.value
  }

  const finalTotal = Math.max(0, (total || 0) - discount)

  return res.status(200).json({
    valid: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value
    },
    discount,
    finalTotal
  })
}

