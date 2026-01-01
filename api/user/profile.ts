import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'
import { sanitizeString, sanitizeEmail } from '../utils/sanitize'

const ProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return

  if (req.method === 'GET') {
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications,
      }
    })
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const parse = ProfileSchema.safeParse(req.body || {})
    if (!parse.success) return res.status(400).json({ error: parse.error.errors })

    const updateData: any = {}
    if (parse.data.name !== undefined) {
      updateData.name = sanitizeString(parse.data.name) || null
    }
    if (parse.data.phone !== undefined) {
      updateData.phone = sanitizeString(parse.data.phone) || null
    }
    if (parse.data.emailNotifications !== undefined) {
      updateData.emailNotifications = parse.data.emailNotifications
    }
    if (parse.data.smsNotifications !== undefined) {
      updateData.smsNotifications = parse.data.smsNotifications
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        emailNotifications: true,
        smsNotifications: true,
      }
    })

    return res.status(200).json({ user: updated })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

