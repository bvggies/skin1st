import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../db' // Fixed import path
import { authGuard } from '../middleware/auth'
import PDFDocument from 'pdfkit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await authGuard(req, res)
  if (!user) return
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' })

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  name: true,
                  slug: true,
                  images: { take: 1 }
                }
              }
            }
          }
        }
      },
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  if (!order) return res.status(404).json({ error: 'Order not found' })

  // Company information
  const companyInfo = {
    name: 'Skin1st Beauty Therapy',
    address: 'Accra, Ghana',
    phone: process.env.COMPANY_PHONE || '+233 XX XXX XXXX',
    email: process.env.COMPANY_EMAIL || 'info@skin1st.com',
    website: process.env.COMPANY_WEBSITE || 'www.skin1st.com'
  }

  // Create PDF
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Delivery Note - ${order.code}`,
      Author: companyInfo.name,
      Subject: `Delivery Note for Order ${order.code}`
    }
  })

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="delivery-note-${order.code}.pdf"`)

  // Pipe PDF to response
  doc.pipe(res)

  // Helper function to add section
  const addSection = (title: string, content: string, y: number) => {
    doc.fontSize(10)
      .fillColor('#666666')
      .text(title, 50, y, { width: 200 })
    doc.fontSize(11)
      .fillColor('#000000')
      .text(content, 50, y + 15, { width: 200 })
    return y + 35
  }

  // Header with logo area and company info
  let yPos = 50

  // Company header box
  doc.rect(50, yPos, 495, 80)
    .fillColor('#1a1a2e')
    .fill()
    .fillColor('#ffffff')

  // Company name
  doc.fontSize(24)
    .font('Helvetica-Bold')
    .fillColor('#ffffff')
    .text(companyInfo.name, 60, yPos + 15, { width: 300 })

  // Company tagline
  doc.fontSize(10)
    .font('Helvetica')
    .fillColor('#ffffff')
    .opacity(0.9)
    .text('Premium Beauty & Skincare Products', 60, yPos + 45, { width: 300 })

  // Order info box (right side)
  doc.rect(360, yPos + 10, 175, 60)
    .fillColor('#ffffff')
    .fill()
    .fillColor('#1a1a2e')

  doc.fontSize(16)
    .font('Helvetica-Bold')
    .fillColor('#1a1a2e')
    .text('DELIVERY NOTE', 370, yPos + 20, { width: 155, align: 'center' })

  doc.fontSize(20)
    .font('Helvetica-Bold')
    .fillColor('#e94560')
    .text(order.code, 370, yPos + 40, { width: 155, align: 'center' })

  yPos += 100

  // Date and status
  doc.fontSize(9)
    .fillColor('#666666')
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 50, yPos)
  doc.text(`Status: ${order.status.replace(/_/g, ' ')}`, 250, yPos)
  doc.text(`Tracking: ${order.trackingCode || 'N/A'}`, 400, yPos)

  yPos += 30

  // Divider
  doc.moveTo(50, yPos)
    .lineTo(545, yPos)
    .strokeColor('#e0e0e0')
    .lineWidth(1)
    .stroke()

  yPos += 20

  // Customer Information Section
  doc.fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#1a1a2e')
    .text('CUSTOMER & DELIVERY INFORMATION', 50, yPos)

  yPos += 25

  // Customer details box
  doc.rect(50, yPos, 240, 120)
    .fillColor('#f8f9fa')
    .fill()
    .strokeColor('#e0e0e0')
    .lineWidth(1)
    .stroke()

  let customerY = yPos + 15
  doc.fontSize(10)
    .fillColor('#666666')
    .text('Customer Name:', 60, customerY)
  doc.fontSize(11)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(order.customerName || order.user?.name || 'Guest Customer', 60, customerY + 12)

  customerY += 30
  doc.fontSize(10)
    .fillColor('#666666')
    .text('Phone:', 60, customerY)
  doc.fontSize(11)
    .fillColor('#000000')
    .text(order.phone || 'N/A', 60, customerY + 12)

  if (order.alternativePhone) {
    customerY += 20
    doc.fontSize(10)
      .fillColor('#666666')
      .text('Alt. Phone:', 60, customerY)
    doc.fontSize(11)
      .fillColor('#000000')
      .text(order.alternativePhone, 60, customerY + 12)
  }

  if (order.user?.email) {
    customerY += 20
    doc.fontSize(10)
      .fillColor('#666666')
      .text('Email:', 60, customerY)
    doc.fontSize(11)
      .fillColor('#000000')
      .text(order.user.email, 60, customerY + 12)
  }

  // Delivery address box
  doc.rect(300, yPos, 245, 120)
    .fillColor('#fff5f5')
    .fill()
    .strokeColor('#e0e0e0')
    .lineWidth(1)
    .stroke()

  let addressY = yPos + 15
  doc.fontSize(10)
    .fillColor('#666666')
    .text('DELIVERY ADDRESS:', 310, addressY)

  addressY += 15
  const addressLines = [
    order.area || '',
    order.city || '',
    order.region || '',
    order.landmark ? `Near: ${order.landmark}` : '',
    order.deliveryAddr || ''
  ].filter(Boolean)

  doc.fontSize(11)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(addressLines.join('\n'), 310, addressY, { width: 225, lineGap: 5 })

  if (order.deliveryNotes) {
    addressY += addressLines.length * 15 + 10
    doc.fontSize(9)
      .fillColor('#666666')
      .text('Notes:', 310, addressY)
    doc.fontSize(10)
      .fillColor('#000000')
      .text(order.deliveryNotes, 310, addressY + 12, { width: 225 })
  }

  yPos += 140

  // Divider
  doc.moveTo(50, yPos)
    .lineTo(545, yPos)
    .strokeColor('#e0e0e0')
    .lineWidth(1)
    .stroke()

  yPos += 20

  // Order Items Section
  doc.fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#1a1a2e')
    .text('ORDER ITEMS', 50, yPos)

  yPos += 25

  // Table header
  doc.rect(50, yPos, 495, 25)
    .fillColor('#1a1a2e')
    .fill()

  doc.fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#ffffff')
    .text('Item', 60, yPos + 8)
    .text('Quantity', 300, yPos + 8)
    .text('Unit Price', 380, yPos + 8)
    .text('Total', 460, yPos + 8, { align: 'right' })

  yPos += 25

  // Order items
  order.items.forEach((item: any, index: number) => {
    const itemHeight = 35
    const isEven = index % 2 === 0

    if (isEven) {
      doc.rect(50, yPos, 495, itemHeight)
        .fillColor('#f8f9fa')
        .fill()
    }

    const productName = item.variant?.product?.name || 'Product'
    const variantName = item.variant?.name || 'Variant'
    const fullName = `${productName}${variantName !== productName ? ` - ${variantName}` : ''}`

    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(fullName, 60, yPos + 8, { width: 230 })

    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#000000')
      .text(`× ${item.quantity}`, 300, yPos + 8)
      .text(`₵${(item.unitPrice / 100).toFixed(2)}`, 380, yPos + 8)
      .text(`₵${((item.unitPrice * item.quantity) / 100).toFixed(2)}`, 460, yPos + 8, { align: 'right' })

    yPos += itemHeight
  })

  // Bottom border
  doc.moveTo(50, yPos)
    .lineTo(545, yPos)
    .strokeColor('#e0e0e0')
    .lineWidth(1)
    .stroke()

  yPos += 20

  // Total section
  doc.rect(350, yPos, 195, 60)
    .fillColor('#fff5f5')
    .fill()
    .strokeColor('#e0e0e0')
    .lineWidth(1)
    .stroke()

  doc.fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text('ORDER TOTAL', 360, yPos + 10)

  doc.fontSize(24)
    .font('Helvetica-Bold')
    .fillColor('#e94560')
    .text(`₵${(order.total / 100).toFixed(2)}`, 360, yPos + 30, { align: 'right', width: 175 })

  yPos += 80

  // Payment method
  doc.fontSize(10)
    .fillColor('#666666')
    .text('Payment Method: Cash on Delivery (COD)', 50, yPos)

  yPos += 30

  // Divider
  doc.moveTo(50, yPos)
    .lineTo(545, yPos)
    .strokeColor('#e0e0e0')
    .lineWidth(1)
    .stroke()

  yPos += 20

  // Delivery Instructions
  doc.fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#1a1a2e')
    .text('DELIVERY INSTRUCTIONS', 50, yPos)

  yPos += 20

  const instructions = [
    '1. Verify customer identity before delivery',
    '2. Collect payment amount: ₵' + (order.total / 100).toFixed(2),
    '3. Confirm delivery address matches the information above',
    '4. Contact customer if address is unclear',
    '5. Mark order as DELIVERED after successful delivery',
    '6. Return undelivered items if customer is unavailable'
  ]

  doc.fontSize(10)
    .fillColor('#000000')
    .text(instructions.join('\n'), 50, yPos, { width: 495, lineGap: 8 })

  yPos += instructions.length * 18 + 20

  // Footer
  const footerY = 750
  doc.moveTo(50, footerY)
    .lineTo(545, footerY)
    .strokeColor('#e0e0e0')
    .lineWidth(1)
    .stroke()

  doc.fontSize(8)
    .fillColor('#666666')
    .text(companyInfo.name, 50, footerY + 10)
    .text(companyInfo.address, 50, footerY + 20)
    .text(`Phone: ${companyInfo.phone} | Email: ${companyInfo.email}`, 50, footerY + 30)
    .text(`Website: ${companyInfo.website}`, 50, footerY + 40)

  doc.fontSize(8)
    .fillColor('#999999')
    .text(`Generated on ${new Date().toLocaleString('en-GB')}`, 400, footerY + 30, { align: 'right' })
    .text(`Order ID: ${order.id}`, 400, footerY + 40, { align: 'right' })

  // Finalize PDF
  doc.end()
}

