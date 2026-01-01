import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { signAccessToken, signRefreshToken, hashToken } from '../utils/jwt'
import { mergeCart } from '../cart.utils'
import { authRateLimit } from '../middleware/rateLimit'

const CartItem = z.object({ variantId: z.string(), quantity: z.number().min(1) })
const LoginSchema = z.object({ email: z.string().email(), password: z.string(), cart: z.array(CartItem).optional() })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  
  // Rate limiting
  if (!authRateLimit(req, res)) return

  const parse = LoginSchema.safeParse(req.body || {})
  if (!parse.success) return res.status(400).json({ error: parse.error.errors })

  const { email, password, cart } = parse.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const accessToken = signAccessToken({ id: user.id, role: user.role })
  const refresh = signRefreshToken({ id: user.id })
  const hashedToken = hashToken(refresh)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  await prisma.refreshToken.create({ data: { token: hashedToken, userId: user.id, expiresAt } })
  res.setHeader('Set-Cookie', `refreshToken=${refresh}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict`)

  // If client provided a guest cart, merge it into the user's cart
  let mergedCart = null
  if (cart && Array.isArray(cart)) {
    mergedCart = await mergeCart(user.id, cart)
  }

  // If a server-side guest cart exists (cookie 'cartId'), merge it too
  const cookiesHeader = req.headers.cookie || ''
  const cookies = cookiesHeader.split(';').map(c=>c.trim()).filter(Boolean).reduce((acc:any, cur:string)=>{ const [k,v]=cur.split('='); acc[k]=v; return acc }, {})
  const token = cookies.cartId
  if (token) {
    const guest = await prisma.cart.findFirst({ where: { cartToken: token }, include: { items: true } })
    if (guest && guest.items && guest.items.length>0) {
      const toMerge = guest.items.map(it=>({ variantId: it.variantId, quantity: it.quantity }))
      mergedCart = await mergeCart(user.id, toMerge)
      // remove guest cart
      await prisma.cart.delete({ where: { id: guest.id } })
      // clear cookie
      res.setHeader('Set-Cookie', `cartId=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`)
    }
  }

  return res.status(200).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, accessToken, cart: mergedCart })
}
