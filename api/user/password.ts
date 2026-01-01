import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const PasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return

  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parse = PasswordSchema.safeParse(req.body || {})
  if (!parse.success) return res.status(400).json({ error: parse.error.errors })

  const { currentPassword, newPassword } = parse.data

  // Verify current password
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) return res.status(404).json({ error: 'User not found' })

  const isValid = await bcrypt.compare(currentPassword, dbUser.password)
  if (!isValid) {
    return res.status(401).json({ error: 'Current password is incorrect' })
  }

  // Hash new password
  const hashed = await bcrypt.hash(newPassword, 10)

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed }
  })

  return res.status(200).json({ success: true, message: 'Password updated successfully' })
}

