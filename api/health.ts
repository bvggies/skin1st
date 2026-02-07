import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from './db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  let dbOk = false
  try {
    await prisma.$queryRaw`SELECT 1`
    dbOk = true
  } catch {
    // DB unreachable
  }
  if (!dbOk) {
    res.status(503).json({ ok: false, uptime: process.uptime(), db: 'unhealthy' })
    return
  }
  res.status(200).json({ ok: true, uptime: process.uptime(), db: 'healthy' })
}
