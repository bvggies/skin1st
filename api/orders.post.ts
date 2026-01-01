import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import prisma from './db'
import { orderRateLimit } from './middleware/rateLimit'
import { sendEmail, orderConfirmationEmail } from './utils/email'

const OrderSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  alternativePhone: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  landmark: z.string().optional(),
  deliveryAddr: z.string().min(5),
  deliveryNotes: z.string().optional(),
  items: z.array(z.object({ variantId: z.string(), quantity: z.number().int().min(1) })),
  coupon: z.string().optional()
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  
  // Rate limiting
  if (!orderRateLimit(req, res)) return

  const parse = OrderSchema.safeParse(req.body || {})
  if (!parse.success) return res.status(400).json({ error: parse.error.errors })

  const { name, phone, alternativePhone, region, city, area, landmark, deliveryAddr, deliveryNotes, items, coupon } = parse.data

  // validate variants and compute total
  const variantIds = items.map(i => i.variantId)
  const variants = await prisma.variant.findMany({ where: { id: { in: variantIds } } })
  if (variants.length !== items.length) return res.status(400).json({ error: 'Invalid variant in items' })

  // validate stock availability
  for (const it of items) {
    const v = variants.find(x => x.id === it.variantId)!
    if (v.stock < it.quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock for ${v.name}. Available: ${v.stock}, Requested: ${it.quantity}` 
      })
    }
  }

  let total = 0
  const orderItemsData = items.map((it) => {
    const v = variants.find(x => x.id === it.variantId)!
    const unitPrice = v.price - (v.discount ?? 0)
    total += unitPrice * it.quantity
    return { variantId: v.id, quantity: it.quantity, unitPrice }
  })

  // apply coupon if provided
  let couponDiscount = 0
  if (coupon) {
    const couponData = await prisma.coupon.findUnique({ where: { code: coupon.toUpperCase() } })
    if (couponData) {
      // check expiry
      if (couponData.expiry && new Date() > couponData.expiry) {
        return res.status(400).json({ error: 'Coupon has expired' })
      }
      // check max uses
      if (couponData.maxUses !== null) {
        // Note: This is a simplified check. In production, you'd track actual uses.
        // For now, we'll just validate the coupon exists and is not expired
      }
      // apply discount
      if (couponData.type === 'percentage') {
        couponDiscount = Math.floor(total * (couponData.value / 100))
      } else if (couponData.type === 'fixed') {
        couponDiscount = couponData.value
      }
      total = Math.max(0, total - couponDiscount)
    } else {
      return res.status(400).json({ error: 'Invalid coupon code' })
    }
  }

  // create order code
  const code = 'ORD-' + Math.random().toString(36).slice(2, 9).toUpperCase()

  // Use transaction to ensure stock is decremented atomically
  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock
    for (const it of items) {
      const v = variants.find(x => x.id === it.variantId)!
      await tx.variant.update({
        where: { id: v.id },
        data: { stock: { decrement: it.quantity } }
      })
    }

    // Create order
    const newOrder = await tx.order.create({ 
      data: { 
        code, 
        status: 'PENDING_CONFIRMATION', 
        total, 
        customerName: name, 
        phone, 
        alternativePhone: alternativePhone || null,
        region: region || null,
        city: city || null,
        area: area || null,
        landmark: landmark || null,
        deliveryAddr, 
        deliveryNotes, 
        items: { create: orderItemsData }, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      } 
    })

    return newOrder
  })

  // store event
  await prisma.eventTracking.create({ 
    data: { 
      type: 'ORDER_CREATED', 
      payload: { 
        orderId: order.id, 
        code,
        coupon: coupon || null,
        couponDiscount: couponDiscount > 0 ? couponDiscount : null
      } 
    } 
  })

  // Send order confirmation email (non-blocking)
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { variant: { include: { product: true } } }
    })
    const emailContent = orderConfirmationEmail(order, orderItems)
    await sendEmail({
      to: order.phone ? `${order.phone}@sms.gateway` : (order.userId ? undefined : undefined), // Adjust based on your email service
      ...emailContent
    })
  } catch (e) {
    console.error('Failed to send order confirmation email:', e)
    // Don't fail order creation if email fails
  }

  return res.status(201).json({ 
    order: { 
      id: order.id, 
      code: order.code, 
      status: order.status,
      total: order.total
    },
    couponApplied: coupon ? true : false,
    discount: couponDiscount > 0 ? couponDiscount : 0
  })
}
