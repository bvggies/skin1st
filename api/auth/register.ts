import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from '../db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { signAccessToken, signRefreshToken, hashToken } from '../utils/jwt'
import { mergeCart } from '../cart.utils'
import { authRateLimit } from '../middleware/rateLimit'
import { sendEmail, welcomeEmail } from '../utils/email'

const CartItem = z.object({ variantId: z.string(), quantity: z.number().min(1) })
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  phone: z.string().optional(),
  cart: z.array(CartItem).optional()
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  
  // Rate limiting
  if (!authRateLimit(req, res)) return

  const parse = RegisterSchema.safeParse(req.body || {})
  if (!parse.success) return res.status(400).json({ error: parse.error.errors })

  const { email, password, name, phone, cart } = parse.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'User already exists' })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, password: hashed, name, phone } })

  // issue tokens
  const accessToken = signAccessToken({ id: user.id, role: user.role })
  const refresh = signRefreshToken({ id: user.id })
  const hashedToken = hashToken(refresh)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
  await prisma.refreshToken.create({ data: { token: hashedToken, userId: user.id, expiresAt } })

  // send cookie
  res.setHeader('Set-Cookie', `refreshToken=${refresh}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict`)

  // Send welcome email (non-blocking)
  try {
    const emailContent = welcomeEmail(user)
    await sendEmail({
      to: user.email,
      ...emailContent
    })
  } catch (e) {
    console.error('Failed to send welcome email:', e)
    // Don't fail registration if email fails
  }

  // merge guest cart if provided
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

  // merge server-side guest cart if cookie present
  const cookiesHeader = req.headers.cookie || ''
  const cookies = cookiesHeader.split(';').map(c=>c.trim()).filter(Boolean).reduce((acc:any, cur:string)=>{ const [k,v]=cur.split('='); acc[k]=v; return acc }, {})
  const token = cookies.cartId
  if (token) {
    const guest = await prisma.cart.findFirst({ where: { cartToken: token }, include: { items: true } })
    if (guest && guest.items && guest.items.length>0) {
      const toMerge = guest.items.map(it=>({ variantId: it.variantId, quantity: it.quantity }))
      mergedCart = await mergeCart(user.id, toMerge)
      await prisma.cart.delete({ where: { id: guest.id } })
      res.setHeader('Set-Cookie', `cartId=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`)
    }
  }

  return res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, accessToken, cart: mergedCart })
}
