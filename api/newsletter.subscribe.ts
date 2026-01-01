import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { sanitizeEmail } from './utils/sanitize'
import { apiRateLimit } from './middleware/rateLimit'

const SubscribeSchema = z.object({
  email: z.string().email()
})

// Note: This would require a Newsletter model in Prisma
// For now, this is a placeholder that can send confirmation emails

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Rate limiting
  if (!apiRateLimit(req, res)) return

  const parse = SubscribeSchema.safeParse(req.body || {})
  if (!parse.success) return res.status(400).json({ error: parse.error.errors })

  const email = sanitizeEmail(parse.data.email)

  // In production, you would:
  // 1. Save to database (Newsletter model)
  // 2. Send confirmation email
  // 3. Add to email marketing service (Mailchimp, etc.)

  // For now, just return success
  return res.status(200).json({
    success: true,
    message: 'Thank you for subscribing! Check your email for confirmation.'
  })
}

