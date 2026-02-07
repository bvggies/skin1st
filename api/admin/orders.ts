import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from '../db'
import { authGuard } from '../middleware/auth'
import { setSecurityHeaders } from '../middleware/security'
import { sanitizeOrder } from '../utils/responseSanitizer'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  setSecurityHeaders(req, res)
  
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // Check if this is a detail request (has id in query or path)
  const id = req.query.id as string | undefined
  
  // If id is provided, return single order detail
  if (id) {
    const order = await prisma.order.findUnique({ 
      where: { id }, 
      include: { 
        items: { include: { variant: true } }, 
        user: true 
      } 
    })
    if (!order) return res.status(404).json({ error: 'Order not found' })

    const events = await prisma.eventTracking.findMany({ 
      where: { orderId: id }, 
      orderBy: { createdAt: 'desc' } 
    })

    return res.status(200).json({ order, events })
  }

  // Otherwise, return order list
  const { page = '1', pageSize = '20', status, q, from, to, userId } = req.query as any
  const p = Math.max(1, Number(page) || 1)
  const ps = Math.min(100, Math.max(1, Number(pageSize) || 20))

  const where: any = {}
  if (status) where.status = status
  if (userId) where.userId = userId
  if (q) {
    where.OR = [
      { code: { contains: q, mode: 'insensitive' } },
      { deliveryAddr: { contains: q, mode: 'insensitive' } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { user: { name: { contains: q, mode: 'insensitive' } } }
    ]
  }
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }

  const total = await prisma.order.count({ where })
  const orders = await prisma.order.findMany({ 
    where, 
    include: { 
      items: { include: { variant: true } }, 
      user: true 
    }, 
    orderBy: { createdAt: 'desc' }, 
    skip: (p - 1) * ps, 
    take: ps 
  })

  // if client requested CSV export, stream as CSV
  if ((req.query.format as any) === 'csv') {
    const header = ['Code','Customer','Total','Status','CreatedAt','DeliveryAddr','Items']
    const rows = orders.map(o => {
      const items = (o.items||[]).map((it:any) => `${it.variant.name} x ${it.quantity}`).join(' ; ')
      const customer = o.user ? (o.user.name || o.user.email) : 'Guest'
      const cols = [o.code, customer, (o.total/100).toFixed(2), o.status, o.createdAt.toISOString(), o.deliveryAddr, items]
      // escape quotes
      return cols.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')
    })
    const csv = [header.join(','), ...rows].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="orders_${Date.now()}.csv"`)
    return res.status(200).send(csv)
  }

  // Sanitize orders - admins can see full data
  const sanitizedOrders = orders.map(o => sanitizeOrder(o, false, true))

  res.status(200).json({ orders: sanitizedOrders, meta: { page: p, pageSize: ps, total } })
}

