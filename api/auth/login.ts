import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from '../db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { signAccessToken, signRefreshToken, hashToken } from '../utils/jwt'
import { mergeCart } from '../cart.utils'
import { authRateLimit } from '../middleware/rateLimit'
import { setSecurityHeaders } from '../middleware/security'
import { sanitizeUser } from '../utils/responseSanitizer'

const CartItem = z.object({ variantId: z.string(), quantity: z.number().min(1) })
const LoginSchema = z.object({ email: z.string().email(), password: z.string(), cart: z.array(CartItem).optional() })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  setSecurityHeaders(req, res)
  
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  
  // Rate limiting
  if (!authRateLimit(req, res)) return

  const parse = LoginSchema.safeParse(req.body || {})
  if (!parse.success) return res.status(400).json({ error: parse.error.errors })

  const { email, password, cart } = parse.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  if (!user.enabled) return res.status(403).json({ error: 'Account is disabled. Contact support.' })

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
    // Filter out any items with missing required properties
    const validCartItems = cart.filter((item): item is { variantId: string; quantity: number } => 
      typeof item.variantId === 'string' && typeof item.quantity === 'number' && item.quantity > 0
    )
    if (validCartItems.length > 0) {
      mergedCart = await mergeCart(user.id, validCartItems)
    }
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

  // Sanitize user data before sending (user can see their own full data except password)
  const sanitizedUser = sanitizeUser(user, true)
  
  return res.status(200).json({ user: sanitizedUser, accessToken, cart: mergedCart })
}
