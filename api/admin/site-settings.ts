import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from '../db'
import { authGuard } from '../middleware/auth'
import { z } from 'zod'

const UpdateSettingsSchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroImageUrl: z.string().url().optional(),
  specialOfferTitle: z.string().optional(),
  specialOfferDescription: z.string().optional(),
  specialOfferCode: z.string().optional(),
  homepageCategories: z.array(z.string()).optional(), // Array of category IDs
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method === 'GET') {
    const settings = await prisma.siteSettings.findMany({
      orderBy: { key: 'asc' }
    })
    
    // Convert array to object for easier access
    const settingsObj: Record<string, string> = {}
    settings.forEach(s => {
      settingsObj[s.key] = s.value
    })

    // Parse homepageCategories from JSON string
    let homepageCategories: string[] = []
    if (settingsObj['homepageCategories']) {
      try {
        homepageCategories = JSON.parse(settingsObj['homepageCategories'])
      } catch (e) {
        homepageCategories = []
      }
    }

    // Return with defaults if not set
    return res.status(200).json({
      heroTitle: settingsObj['heroTitle'] || 'Discover Your Natural Beauty',
      heroSubtitle: settingsObj['heroSubtitle'] || 'Premium beauty and skin therapy products. Quality you can trust, delivered to your doorstep with cash on delivery.',
      heroImageUrl: settingsObj['heroImageUrl'] || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
      specialOfferTitle: settingsObj['specialOfferTitle'] || 'Special Offer - 20% Off',
      specialOfferDescription: settingsObj['specialOfferDescription'] || 'Use code FIRST20 on your first order. Limited time only!',
      specialOfferCode: settingsObj['specialOfferCode'] || 'FIRST20',
      homepageCategories,
    })
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const parse = UpdateSettingsSchema.safeParse(req.body || {})
    if (!parse.success) return res.status(400).json({ error: parse.error.errors })

    const updates = parse.data
    const settingsToUpdate = [
      { key: 'heroTitle', value: updates.heroTitle },
      { key: 'heroSubtitle', value: updates.heroSubtitle },
      { key: 'heroImageUrl', value: updates.heroImageUrl },
      { key: 'specialOfferTitle', value: updates.specialOfferTitle },
      { key: 'specialOfferDescription', value: updates.specialOfferDescription },
      { key: 'specialOfferCode', value: updates.specialOfferCode },
      { key: 'homepageCategories', value: updates.homepageCategories ? JSON.stringify(updates.homepageCategories) : undefined },
    ].filter(item => item.value !== undefined)

    // Update or create each setting
    await Promise.all(
      settingsToUpdate.map(async ({ key, value }) => {
        await prisma.siteSettings.upsert({
          where: { key },
          update: {
            value: value!,
            updatedBy: user.id,
          },
          create: {
            key,
            value: value!,
            description: key,
            updatedBy: user.id,
          },
        })
      })
    )

    // Return updated settings
    const updatedSettings = await prisma.siteSettings.findMany({
      where: { key: { in: settingsToUpdate.map(s => s.key) } },
    })

    const settingsObj: Record<string, string> = {}
    updatedSettings.forEach(s => {
      settingsObj[s.key] = s.value
    })

    // Parse homepageCategories from JSON string
    let homepageCategories: string[] = []
    if (settingsObj['homepageCategories']) {
      try {
        homepageCategories = JSON.parse(settingsObj['homepageCategories'])
      } catch (e) {
        homepageCategories = []
      }
    } else if (updates.homepageCategories) {
      homepageCategories = updates.homepageCategories
    }

    return res.status(200).json({
      heroTitle: settingsObj['heroTitle'] || updates.heroTitle || 'Discover Your Natural Beauty',
      heroSubtitle: settingsObj['heroSubtitle'] || updates.heroSubtitle || 'Premium beauty and skin therapy products. Quality you can trust, delivered to your doorstep with cash on delivery.',
      heroImageUrl: settingsObj['heroImageUrl'] || updates.heroImageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
      specialOfferTitle: settingsObj['specialOfferTitle'] || updates.specialOfferTitle || 'Special Offer - 20% Off',
      specialOfferDescription: settingsObj['specialOfferDescription'] || updates.specialOfferDescription || 'Use code FIRST20 on your first order. Limited time only!',
      specialOfferCode: settingsObj['specialOfferCode'] || updates.specialOfferCode || 'FIRST20',
      homepageCategories,
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

