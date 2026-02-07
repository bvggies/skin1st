import { VercelRequest, VercelResponse } from '@vercel/node'
import { authGuard } from '../middleware/auth'
import { getPrisma } from '../db'
import { setSecurityHeaders } from '../middleware/security'
import { sanitizeOrder } from '../utils/responseSanitizer'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  setSecurityHeaders(req, res)
  
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const user = await authGuard(req, res)
  if (!user) return

  const orders = await prisma.order.findMany({ 
    where: { userId: user.id }, 
    include: { 
      items: { 
        include: { 
          variant: {
            include: {
              product: {
                select: {
                  name: true,
                  slug: true,
                  images: { take: 1 }
                }
              }
            }
          }
        } 
      } 
    }, 
    orderBy: { createdAt: 'desc' } 
  })
  
  // Sanitize orders - users can see their own full order data
  const sanitizedOrders = orders.map(o => sanitizeOrder(o, true, false))
  
  res.status(200).json({ orders: sanitizedOrders })
}

