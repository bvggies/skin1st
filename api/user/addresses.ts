import { VercelRequest, VercelResponse } from '@vercel/node'
import { authGuard } from '../middleware/auth'
import prisma from '../db'
import { z } from 'zod'

const AddressSchema = z.object({
  label: z.string().min(1),
  recipientName: z.string().min(1),
  phone: z.string().min(5),
  alternativePhone: z.string().optional(),
  region: z.string().min(1),
  city: z.string().min(1),
  area: z.string().optional(),
  landmark: z.string().optional(),
  fullAddress: z.string().min(5),
  isDefault: z.boolean().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return

  // GET - List all addresses
  if (req.method === 'GET') {
    const addresses = await prisma.savedAddress.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
    return res.status(200).json({ addresses })
  }

  // POST - Create new address
  if (req.method === 'POST') {
    const parse = AddressSchema.safeParse(req.body || {})
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors })
    }

    const { label, recipientName, phone, alternativePhone, region, city, area, landmark, fullAddress, isDefault } = parse.data

    // If setting as default, unset other defaults first
    if (isDefault) {
      await prisma.savedAddress.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      })
    }

    const address = await prisma.savedAddress.create({
      data: {
        userId: user.id,
        label,
        recipientName,
        phone,
        alternativePhone: alternativePhone || null,
        region,
        city,
        area: area || null,
        landmark: landmark || null,
        fullAddress,
        isDefault: isDefault || false,
      },
    })

    return res.status(201).json({ address })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

