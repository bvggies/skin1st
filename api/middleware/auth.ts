import { VercelRequest, VercelResponse } from '@vercel/node'
import { verify as verifyJwt } from 'jsonwebtoken'
import prisma from '../db'

export async function requireAuth(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization']
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
  if (!token) return null
  try {
    const payload: any = verifyJwt(token as string, process.env.JWT_ACCESS_SECRET || 'dev_access_secret')
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    return user
  } catch (err) {
    return null
  }
}

export async function authGuard(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuth(req, res)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  return user
}