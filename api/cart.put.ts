import { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from './middleware/auth'
import prisma from './db'
import { cuid } from 'cuid'

function parseCookies(cookieHeader: string) {
  return cookieHeader.split(';').map(c => c.trim()).filter(Boolean).reduce((acc: any, cur: string) => {
    const [k, v] = cur.split('=')
    acc[k] = v
    return acc
  }, {})
}

// Expects body: { items: [{ variantId: string, quantity: number }] }
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' })
  const parse = req.body
  if (!parse || !Array.isArray(parse.items)) return res.status(400).json({ error: 'Invalid payload' })

  // allow unauthenticated guests via cookie cartId
  const user = await requireAuth(req, res) // doesn't send 401
  let cart
  if (user) {
    cart = await prisma.cart.findFirst({ where: { userId: user.id } })
    if (!cart) cart = await prisma.cart.create({ data: { userId: user.id } })
  } else {
    const cookies = parseCookies(req.headers.cookie || '')
    const token = cookies.cartId
    if (token) {
      cart = await prisma.cart.findFirst({ where: { cartToken: token } })
      if (!cart) {
        cart = await prisma.cart.create({ data: { cartToken: token } })
      }
    } else {
      // create guest cart and set cookie
      const token = cuid()
      cart = await prisma.cart.create({ data: { cartToken: token } })
      res.setHeader('Set-Cookie', `cartId=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict`)
    }
  }

  // Validate stock availability
  const variantIds = parse.items.map((it: any) => it.variantId)
  const variants = await prisma.variant.findMany({ where: { id: { in: variantIds } } })
  
  for (const it of parse.items) {
    const variant = variants.find(v => v.id === it.variantId)
    if (!variant) {
      return res.status(400).json({ error: `Variant ${it.variantId} not found` })
    }
    if (variant.stock < Number(it.quantity)) {
      return res.status(400).json({ 
        error: `Insufficient stock for ${variant.name}. Available: ${variant.stock}, Requested: ${it.quantity}` 
      })
    }
  }

  // Replace items (simple approach)
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  const itemsData = parse.items.map((it: any) => ({ cartId: cart!.id, variantId: it.variantId, quantity: Number(it.quantity) }))
  await prisma.cartItem.createMany({ data: itemsData })

  const updated = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: { include: { variant: { include: { product: true } } } } } })
  res.status(200).json({ cart: updated })
}
