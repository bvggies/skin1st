import { VercelRequest, VercelResponse } from '@vercel/node'
import { getPrisma } from './db'
import { requireAuth } from './middleware/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prisma = await getPrisma()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid order ID' })

  // Allow authenticated users or guests with order code
  const user = await requireAuth(req, res)
  const { code } = req.query

  let order
  if (user) {
    // Authenticated user - search by id and userId
    order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        },
        user: true
      }
    })
  }
  
  // If not found by user or user not authenticated, try by code
  if (!order && code && typeof code === 'string') {
    order = await prisma.order.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true
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
  }
  
  // If still not found and we have an id, try by id only (for guest access)
  if (!order && id) {
    order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true
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
  }

  if (!order) return res.status(404).json({ error: 'Order not found' })

  // Generate simple invoice HTML
  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${order.code}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Skin1st Beauty Therapy</h1>
        <p>Invoice</p>
      </div>
      <div class="invoice-details">
        <div>
          <p><strong>Order Code:</strong> ${order.code}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          ${order.user ? `<p><strong>Customer:</strong> ${order.user.name || order.user.email}</p>` : ''}
        </div>
        <div>
          <p><strong>Status:</strong> ${order.status}</p>
          ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ''}
        </div>
      </div>
      <h2>Items</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item: any) => `
            <tr>
              <td>${item.variant?.product?.name || 'Product'} - ${item.variant?.name || 'Variant'}</td>
              <td>${item.quantity}</td>
              <td>₵${(item.unitPrice / 100).toFixed(2)}</td>
              <td>₵${((item.unitPrice * item.quantity) / 100).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="total">
        <p>Total: ₵${(order.total / 100).toFixed(2)}</p>
      </div>
      ${order.deliveryAddr ? `
        <div>
          <h3>Delivery Address</h3>
          <p>${order.deliveryAddr}</p>
        </div>
      ` : ''}
      <div class="footer">
        <p>Thank you for your order!</p>
        <p>Skin1st Beauty Therapy</p>
      </div>
    </body>
    </html>
  `

  res.setHeader('Content-Type', 'text/html')
  return res.status(200).send(invoiceHtml)
}

