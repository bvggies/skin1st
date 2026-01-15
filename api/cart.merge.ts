import { VercelRequest, VercelResponse } from '@vercel/node'
import { authGuard } from './middleware/auth'
import { z } from 'zod'
import { mergeCart } from './cart.utils'

const CartSchema = z.object({ items: z.array(z.object({ variantId: z.string(), quantity: z.number().min(1) })) })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await authGuard(req, res)
  if (!user) return

  const parse = CartSchema.safeParse(req.body || {})
  if (!parse.success) return res.status(400).json({ error: parse.error.errors })

  // TypeScript type assertion - Zod validation ensures items have required properties
  const merged = await mergeCart(user.id, parse.data.items as { variantId: string; quantity: number }[])
  return res.status(200).json({ cart: merged })
}
