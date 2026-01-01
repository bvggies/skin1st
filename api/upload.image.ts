import { VercelRequest, VercelResponse } from '@vercel/node'
import { authGuard } from './middleware/auth'

// This is a placeholder for image upload
// In production, you'd use a service like Cloudinary, AWS S3, or Vercel Blob

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // For now, this accepts a URL
  // In production, you'd handle file upload here
  const { url, alt } = req.body

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Image URL is required' })
  }

  // Validate URL
  try {
    new URL(url)
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' })
  }

  // In production, you would:
  // 1. Accept file upload (multipart/form-data)
  // 2. Upload to Cloudinary/S3/Vercel Blob
  // 3. Get back the URL
  // 4. Return the URL

  // For now, just return the URL (assuming it's already uploaded)
  return res.status(200).json({
    url,
    alt: alt || null,
    message: 'Image URL accepted. In production, this would upload the file to a CDN.'
  })
}

// Example Cloudinary implementation (uncomment and configure):
/*
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Handle file upload
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return res.status(400).json({ error: 'No file provided' })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')
  const dataURI = `data:${file.type};base64,${base64}`

  try {
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'skin1st/products',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    })

    return res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id
    })
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return res.status(500).json({ error: 'Failed to upload image' })
  }
}
*/

