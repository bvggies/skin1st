import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'
import { sendWhatsappNotification } from '../utils/notifications'
import { sendEmail, orderStatusUpdateEmail } from '../utils/email'

const StatusSchema = z.object({ 
  status: z.enum(['PENDING_CONFIRMATION','CONFIRMED','OUT_FOR_DELIVERY','DELIVERED','PAID','COMPLETED','CANCELLED']),
  note: z.string().optional(),
  location: z.string().optional()
})

function getDefaultStatusNote(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Order has been confirmed and is being processed'
    case 'OUT_FOR_DELIVERY':
      return 'Package is out for delivery'
    case 'DELIVERED':
      return 'Package has been delivered'
    case 'PAID':
      return 'Payment has been received'
    case 'COMPLETED':
      return 'Order has been completed successfully'
    case 'CANCELLED':
      return 'Order has been cancelled'
    default:
      return 'Status updated'
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' })

  if (req.method !== 'PUT' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const parse = StatusSchema.safeParse(req.body || {})
  if (!parse.success) return res.status(400).json({ error: parse.error.errors })

  const prev = await prisma.order.findUnique({ where: { id } })
  if (!prev) return res.status(404).json({ error: 'Order not found' })

  const { status, note, location } = parse.data
  
  // Update order status and add to status history
  const order = await prisma.order.update({ 
    where: { id }, 
    data: { 
      status,
      // Set delivered date if status is DELIVERED
      ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      statusHistory: {
        create: {
          status,
          note: note || getDefaultStatusNote(status),
          location: location || null
        }
      }
    } 
  })

  // record event tracking
  try{
    await prisma.eventTracking.create({ data: { type: 'order_status_changed', payload: { orderId: id, adminId: user.id, from: prev.status, to: parse.data.status }, orderId: id } })
  }catch(e){ /* ignore errors in logging */ }

  // send notification when moving to OUT_FOR_DELIVERY
  try {
    if (parse.data.status === 'OUT_FOR_DELIVERY' && order.phone) {
      await sendWhatsappNotification(order.phone, `Your order ${order.code} is out for delivery. We'll contact you soon.`)
      await prisma.eventTracking.create({ data: { type: 'notification_sent', payload: { channel: 'whatsapp', to: order.phone, message: `Your order ${order.code} is out for delivery. We'll contact you soon.` }, orderId: id } })
    }
  }catch(err){
    console.error('Failed sending whatsapp notification', err)
    try{ await prisma.eventTracking.create({ data: { type: 'notification_failed', payload: { channel: 'whatsapp', error: (err as any)?.message || String(err) }, orderId: id } }) }catch(e){}
  }

  // Send email notification for status updates (non-blocking)
  try {
    let recipientEmail: string | undefined
    
    // Get user email if logged in, or use guest email
    if (order.userId) {
      const user = await prisma.user.findUnique({ where: { id: order.userId } })
      recipientEmail = user?.email
    } else if (order.guestEmail) {
      recipientEmail = order.guestEmail
    }
    
    // Send email if we have a recipient
    if (recipientEmail) {
      const emailContent = orderStatusUpdateEmail(order, parse.data.status)
      await sendEmail({
        to: recipientEmail,
        ...emailContent
      })
    }
  } catch (err) {
    console.error('Failed to send status update email:', err)
    // Don't fail status update if email fails
  }

  return res.status(200).json({ order })
}
