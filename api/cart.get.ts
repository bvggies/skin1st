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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  // allow unauthenticated guests by detecting cookie cartId
  const user = await requireAuth(req, res) // does not send 401
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

  // no user and no cart cookie
  res.status(200).json({ cart: { items: [] } })
}
