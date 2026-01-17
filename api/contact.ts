import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { sanitizeString, sanitizeEmail } from './utils/sanitize'
import { sendEmail } from './utils/email'
import { apiRateLimit } from './middleware/rateLimit'
import { setSecurityHeaders } from './middleware/security'

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(10)
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(req, res)
  
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Rate limiting
  if (!apiRateLimit(req, res)) return

  const parse = ContactSchema.safeParse(req.body || {})
  if (!parse.success) return res.status(400).json({ error: parse.error.errors })

  const { name, email, phone, subject, message } = parse.data

  // Sanitize inputs
  const sanitizedName = sanitizeString(name)
  const sanitizedEmail = sanitizeEmail(email)
  const sanitizedPhone = phone ? sanitizeString(phone) : null
  const sanitizedSubject = sanitizeString(subject)
  const sanitizedMessage = sanitizeString(message)

  // Send email to support (non-blocking)
  try {
    await sendEmail({
      to: process.env.SUPPORT_EMAIL || 'info@skin1stbeauty.com',
      subject: `Contact Form: ${sanitizedSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          ${sanitizedPhone ? `<p><strong>Phone:</strong> ${sanitizedPhone}</p>` : ''}
          <p><strong>Subject:</strong> ${sanitizedSubject}</p>
          <p><strong>Message:</strong></p>
          <p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
        </div>
      `,
      text: `Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\n${sanitizedPhone ? `Phone: ${sanitizedPhone}\n` : ''}Subject: ${sanitizedSubject}\n\nMessage:\n${sanitizedMessage}`
    })
  } catch (e) {
    console.error('Failed to send contact email:', e)
    // Don't fail the request if email fails
  }

  return res.status(200).json({ success: true, message: 'Thank you for contacting us. We\'ll get back to you soon.' })
}

