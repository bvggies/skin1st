import { VercelRequest, VercelResponse } from '@vercel/node'
import { authGuard } from './middleware/auth'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
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

  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    // Fallback: accept URL if Cloudinary not configured
    const { url, alt } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Image URL is required (Cloudinary not configured)' })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' })
    }

    return res.status(200).json({
      url,
      alt: alt || null,
      message: 'Image URL accepted. Configure Cloudinary for file uploads.'
    })
  }

  // Handle file upload to Cloudinary
  const { file, url, alt } = req.body

  // If URL is provided, use it (for backward compatibility)
  if (url && typeof url === 'string') {
    try {
      new URL(url)
      return res.status(200).json({
        url,
        alt: alt || null
      })
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' })
    }
  }

  // Handle base64 file upload
  if (file && typeof file === 'string') {
    try {
      // Check if it's a data URI
      if (!file.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid file format. Expected base64 data URI.' })
      }

      const result = await cloudinary.uploader.upload(file, {
        folder: 'skin1st/products',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        resource_type: 'image'
      })

      return res.status(200).json({
        url: result.secure_url,
        publicId: result.public_id,
        alt: alt || null
      })
    } catch (error: any) {
      console.error('Cloudinary upload error:', error)
      return res.status(500).json({ 
        error: 'Failed to upload image to Cloudinary',
        details: error.message 
      })
    }
  }

  return res.status(400).json({ error: 'Either file (base64) or url is required' })
}
