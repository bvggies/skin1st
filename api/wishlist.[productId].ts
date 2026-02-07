import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from './db'
import { authGuard } from './middleware/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  const user = await authGuard(req, res)
  if (!user) return

  const { productId } = req.query
  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  await prisma.wishlist.deleteMany({
    where: {
      userId: user.id,
      productId: productId
    }
  })

  return res.status(200).json({ success: true })
}

