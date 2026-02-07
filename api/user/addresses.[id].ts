import { VercelRequest, VercelResponse } from '@vercel/node'
import { authGuard } from '../middleware/auth'
import { getPrisma } from '../db'
import { z } from 'zod'

const AddressSchema = z.object({
  label: z.string().min(1).optional(),
  recipientName: z.string().min(1).optional(),
  phone: z.string().min(5).optional(),
  alternativePhone: z.string().optional(),
  region: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  area: z.string().optional(),
  landmark: z.string().optional(),
  fullAddress: z.string().min(5).optional(),
  isDefault: z.boolean().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  const user = await authGuard(req, res)
  if (!user) return

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Address ID is required' })
  }

  // Check if address belongs to user
  const existingAddress = await prisma.savedAddress.findFirst({
    where: { id, userId: user.id },
  })

  if (!existingAddress) {
    return res.status(404).json({ error: 'Address not found' })
  }

  // GET - Get single address
  if (req.method === 'GET') {
    return res.status(200).json({ address: existingAddress })
  }

  // PUT - Update address
  if (req.method === 'PUT') {
    const parse = AddressSchema.safeParse(req.body || {})
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors })
    }

    const updateData: any = {}
    const data = parse.data

    if (data.label !== undefined) updateData.label = data.label
    if (data.recipientName !== undefined) updateData.recipientName = data.recipientName
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.alternativePhone !== undefined) updateData.alternativePhone = data.alternativePhone || null
    if (data.region !== undefined) updateData.region = data.region
    if (data.city !== undefined) updateData.city = data.city
    if (data.area !== undefined) updateData.area = data.area || null
    if (data.landmark !== undefined) updateData.landmark = data.landmark || null
    if (data.fullAddress !== undefined) updateData.fullAddress = data.fullAddress

    // If setting as default, unset other defaults first
    if (data.isDefault === true) {
      await prisma.savedAddress.updateMany({
        where: { userId: user.id, id: { not: id } },
        data: { isDefault: false },
      })
      updateData.isDefault = true
    } else if (data.isDefault === false) {
      updateData.isDefault = false
    }

    const address = await prisma.savedAddress.update({
      where: { id },
      data: updateData,
    })

    return res.status(200).json({ address })
  }

  // DELETE - Delete address
  if (req.method === 'DELETE') {
    await prisma.savedAddress.delete({
      where: { id },
    })

    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

