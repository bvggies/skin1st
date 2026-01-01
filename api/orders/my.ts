import { VercelRequest, VercelResponse } from '@vercel/node'
import { authGuard } from '../middleware/auth'
import prisma from '../db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const user = await authGuard(req, res)
  if (!user) return

  // Log for debugging (remove in production)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Fetching orders for user:', user.id, user.email)
  }

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
  
  // Log for debugging (remove in production)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Found orders:', orders.length, 'for user:', user.id)
  }
  
  res.status(200).json({ orders })
}

