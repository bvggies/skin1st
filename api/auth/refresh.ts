import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { verifyRefreshToken, signRefreshToken, signAccessToken, hashToken } from '../utils/jwt'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const cookies = parseCookies(req.headers.cookie || '')
  const token = cookies.refreshToken
  if (!token) return res.status(401).json({ error: 'No refresh token' })

  try {
    const payload: any = verifyRefreshToken(token)
    const hashed = hashToken(token)
    const dbToken = await prisma.refreshToken.findUnique({ where: { token: hashed } })
    if (!dbToken || dbToken.revoked) return res.status(401).json({ error: 'Invalid token' })
    if (new Date() > dbToken.expiresAt) return res.status(401).json({ error: 'Token expired' })

    // rotate: revoke old and create new
    await prisma.refreshToken.update({ where: { id: dbToken.id }, data: { revoked: true } })
    const newRefresh = signRefreshToken({ id: payload.id })
    const newHashed = hashToken(newRefresh)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    await prisma.refreshToken.create({ data: { token: newHashed, userId: dbToken.userId, expiresAt } })

    const accessToken = signAccessToken({ id: payload.id })
    res.setHeader('Set-Cookie', `refreshToken=${newRefresh}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict`)
    return res.status(200).json({ accessToken })
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

function parseCookies(cookieHeader: string) {
  return cookieHeader.split(';').map(c => c.trim()).filter(Boolean).reduce((acc: any, cur: string) => {
    const [k, v] = cur.split('=')
    acc[k] = v
    return acc
  }, {})
}