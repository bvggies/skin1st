import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'
import { sendWhatsappNotification } from '../../utils/notifications'
import { sendEmail, orderStatusUpdateEmail } from '../../utils/email'

const StatusSchema = z.object({ status: z.enum(['PENDING_CONFIRMATION','CONFIRMED','OUT_FOR_DELIVERY','DELIVERED','PAID','COMPLETED','CANCELLED']) })

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  const order = await prisma.order.update({ where: { id }, data: { status: parse.data.status } })

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
    if (order.userId) {
      const user = await prisma.user.findUnique({ where: { id: order.userId } })
      if (user && user.email) {
        const emailContent = orderStatusUpdateEmail(order, parse.data.status)
        await sendEmail({
          to: user.email,
          ...emailContent
        })
      }
    }
  } catch (err) {
    console.error('Failed to send status update email:', err)
    // Don't fail status update if email fails
  }

  return res.status(200).json({ order })
}
