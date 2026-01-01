import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './db'
import { authGuard } from './middleware/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const items = await prisma.wishlist.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          images: true,
          variants: true,
          brand: true,
          category: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return res.status(200).json({ items })
}

