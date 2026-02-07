import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from '../db'
import { hashToken } from '../utils/jwt'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const cookieHeader = req.headers.cookie || ''
  const cookies = cookieHeader.split(';').map(c=>c.trim()).filter(Boolean).reduce((acc:any, cur:string)=>{ const [k,v]=cur.split('='); acc[k]=v; return acc }, {})
  const token = cookies.refreshToken
  if (token) {
    try {
      const hashed = hashToken(token)
      await prisma.refreshToken.updateMany({ where: { token: hashed }, data: { revoked: true } })
    } catch (e) {
      // ignore
    }
  }
  // convert user's cart to a guest cart so items are preserved
  try{
    const token = `guest_${Date.now()}`
    // find user's cart
    const uid = await (async ()=>{
      if (!token) return null
      const cookies = req.headers.cookie || ''
      // get refresh token payload to find user id -- but simpler: try to read access token from Authorization header
      const authHeader = req.headers['authorization'] || req.headers['Authorization']
      const bearer = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
      if (!bearer) return null
      try{
        const payload:any = require('../utils/jwt').verifyAccessToken(bearer)
        return payload.id
      }catch(e){ return null }
    })()
    if (uid) {
      const cart = await prisma.cart.findFirst({ where: { userId: uid } })
      if (cart) {
        await prisma.cart.update({ where: { id: cart.id }, data: { userId: null, cartToken: token } })
        res.setHeader('Set-Cookie', `cartId=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict`)
      }
    }
  }catch(e){ /* ignore */ }

  // clear refresh cookie
  res.setHeader('Set-Cookie', `refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`)
  return res.status(200).json({ ok: true })
}
