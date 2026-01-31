import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { setSecurityHeaders } from '../middleware/security'
import { maskPhone, maskEmail } from '../utils/responseSanitizer'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(req, res)
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { code, trackingCode, phone } = req.query
  
  // Allow tracking by either order code or tracking code
  if ((!code && !trackingCode) || (code && typeof code !== 'string') || (trackingCode && typeof trackingCode !== 'string')) {
    return res.status(400).json({ error: 'Order code or tracking code required' })
  }

  let order
  if (trackingCode && typeof trackingCode === 'string') {
    // Search by tracking code (for guests)
    order = await prisma.order.findUnique({ 
      where: { trackingCode }, 
      include: { 
        items: { 
          include: { 
            variant: { 
              include: { 
                product: { 
                  select: { name: true, slug: true, images: { take: 1 } } 
                } 
              } 
            } 
          } 
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      } 
    })
  } else if (code && typeof code === 'string') {
    // Search by order code (normalize to uppercase for consistency)
    order = await prisma.order.findUnique({ 
      where: { code: code.toUpperCase() }, 
      include: { 
        items: { 
          include: { 
            variant: { 
              include: { 
                product: { 
                  select: { name: true, slug: true, images: { take: 1 } } 
                } 
              } 
            } 
          } 
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      } 
    })
  }
  
  if (!order) return res.status(404).json({ error: 'Order not found. Please check your tracking code and try again.' })
  
  // Optionally verify phone if provided (additional security)
  if (phone && typeof phone === 'string') {
    if (order.phone !== phone && order.alternativePhone !== phone) {
      return res.status(403).json({ error: 'Phone number does not match order records' })
    }
  }

  // Calculate estimated delivery if not set
  let estimatedDelivery = order.estimatedDelivery
  if (!estimatedDelivery && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && order.status !== 'COMPLETED') {
    // Estimate 3-5 business days from order date
    const orderDate = new Date(order.createdAt)
    estimatedDelivery = new Date(orderDate.getTime() + (4 * 24 * 60 * 60 * 1000)) // 4 days average
  }

  // Generate tracking code for legacy orders that don't have one
  let orderTrackingCode = order.trackingCode
  if (!orderTrackingCode) {
    const prefix = 'TRK'
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).slice(2, 6).toUpperCase()
    orderTrackingCode = `${prefix}-${timestamp}-${random}`
    
    // Update order with new tracking code
    await prisma.order.update({
      where: { id: order.id },
      data: { trackingCode: orderTrackingCode }
    })
  }

  // Format response with tracking info
  const response = {
    order: {
      id: order.id,
      code: order.code,
      trackingCode: orderTrackingCode,
      status: order.status,
      total: order.total,
      customerName: order.customerName,
      phone: order.phone?.slice(0, 3) + '****' + order.phone?.slice(-3), // Mask phone for privacy
      deliveryAddr: order.deliveryAddr,
      region: order.region,
      city: order.city,
      area: order.area,
      landmark: order.landmark,
      deliveryNotes: order.deliveryNotes,
      estimatedDelivery,
      deliveredAt: order.deliveredAt,
      items: order.items.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        variant: {
          name: item.variant.name,
          product: item.variant.product
        }
      })),
      statusHistory: order.statusHistory,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }
  }

  res.status(200).json(response)
}
