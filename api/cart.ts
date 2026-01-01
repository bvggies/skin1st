import { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from './middleware/auth'
import prisma from './db'

function parseCookies(cookieHeader: string) {
  return cookieHeader.split(';').map(c => c.trim()).filter(Boolean).reduce((acc: any, cur: string) => {
    const [k, v] = cur.split('=')
    acc[k] = v
    return acc
  }, {})
}

function cuid() {
  return 'cart_' + Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res)
  } else if (req.method === 'PUT') {
    return handlePut(req, res)
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuth(req, res)
  if (user) {
    const cart = await prisma.cart.findFirst({ where: { userId: user.id }, include: { items: { include: { variant: { include: { product: true } } } } } })
    if (!cart) return res.status(200).json({ cart: { items: [] } })
    return res.status(200).json({ cart })
  }

  const cookies = parseCookies(req.headers.cookie || '')
  const cartId = cookies.cartId
  if (cartId) {
    const cart = await prisma.cart.findFirst({ where: { cartToken: cartId }, include: { items: { include: { variant: { include: { product: true } } } } } })
    if (!cart) return res.status(200).json({ cart: { items: [] } })
    return res.status(200).json({ cart })
  }

  res.status(200).json({ cart: { items: [] } })
}

async function handlePut(req: VercelRequest, res: VercelResponse) {
  const parse = req.body
  if (!parse || !Array.isArray(parse.items)) return res.status(400).json({ error: 'Invalid payload' })

  const user = await requireAuth(req, res)
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
      const token = cuid()
      cart = await prisma.cart.create({ data: { cartToken: token } })
      res.setHeader('Set-Cookie', `cartId=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict`)
    }
  }

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

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  const itemsData = parse.items.map((it: any) => ({ cartId: cart!.id, variantId: it.variantId, quantity: Number(it.quantity) }))
  await prisma.cartItem.createMany({ data: itemsData })

  const updated = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: { include: { variant: { include: { product: true } } } } } })
  res.status(200).json({ cart: updated })
}

