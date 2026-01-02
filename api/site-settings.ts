import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const settings = await prisma.siteSettings.findMany({
    orderBy: { key: 'asc' }
  })
  
  // Convert array to object for easier access
  const settingsObj: Record<string, string> = {}
  settings.forEach(s => {
    settingsObj[s.key] = s.value
  })

  // Return with defaults if not set
  return res.status(200).json({
    heroTitle: settingsObj['heroTitle'] || 'Discover Your Natural Beauty',
    heroSubtitle: settingsObj['heroSubtitle'] || 'Premium beauty and skin therapy products. Quality you can trust, delivered to your doorstep with cash on delivery.',
    heroImageUrl: settingsObj['heroImageUrl'] || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    specialOfferTitle: settingsObj['specialOfferTitle'] || 'Special Offer - 20% Off',
    specialOfferDescription: settingsObj['specialOfferDescription'] || 'Use code FIRST20 on your first order. Limited time only!',
    specialOfferCode: settingsObj['specialOfferCode'] || 'FIRST20',
  })
}

