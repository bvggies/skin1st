// Email utility using a simple SMTP or service like SendGrid, Mailgun, etc.
// This is a template - you'll need to configure with your email service

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const emailService = process.env.EMAIL_SERVICE || 'console' // console, sendgrid, mailgun, smtp

  switch (emailService) {
    case 'console':
      // Development: just log to console
      console.log('📧 Email would be sent:')
      console.log('To:', options.to)
      console.log('Subject:', options.subject)
      console.log('Body:', options.text || options.html)
      return

    case 'sendgrid':
      // SendGrid implementation
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      await sgMail.send({
        to: options.to,
        from: process.env.EMAIL_FROM || 'noreply@skin1st.com',
        subject: options.subject,
        text: options.text,
        html: options.html
      })
      return

    case 'mailgun':
      // Mailgun implementation
      const formData = require('form-data')
      const Mailgun = require('mailgun.js')
      const mailgun = new Mailgun(formData)
      const mg = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY || ''
      })
      await mg.messages.create(process.env.MAILGUN_DOMAIN || '', {
        from: process.env.EMAIL_FROM || 'noreply@skin1st.com',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      })
      return

    case 'smtp':
      // SMTP implementation using nodemailer
      const nodemailer = require('nodemailer')
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@skin1st.com',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      })
      return

    default:
      throw new Error(`Unknown email service: ${emailService}`)
  }
}

// Email templates
export function orderConfirmationEmail(order: any, items: any[]) {
  const total = (order.total / 100).toFixed(2)
  return {
    subject: `Order Confirmation - ${order.code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for your order!</h2>
        <p>Your order <strong>${order.code}</strong> has been received and is being processed.</p>
        
        <h3>Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${items.map(item => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.variant?.name || 'Product'}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">× ${item.quantity}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₵${(item.unitPrice / 100).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr>
            <td colspan="2" style="padding: 8px; font-weight: bold;">Total</td>
            <td style="padding: 8px; text-align: right; font-weight: bold;">₵${total}</td>
          </tr>
        </table>
        
        <h3>Delivery Address</h3>
        <p>${order.deliveryAddr}</p>
        
        <p>We'll contact you shortly to confirm your order. You can track your order using code: <strong>${order.code}</strong></p>
        
        <p>Thank you for shopping with Skin1st Beauty Therapy!</p>
      </div>
    `,
    text: `Thank you for your order ${order.code}. Total: ₵${total}. We'll contact you shortly.`
  }
}

export function orderStatusUpdateEmail(order: any, newStatus: string) {
  const statusMessages: Record<string, string> = {
    CONFIRMED: 'Your order has been confirmed and is being prepared.',
    OUT_FOR_DELIVERY: 'Your order is out for delivery! We\'ll contact you soon.',
    DELIVERED: 'Your order has been delivered. Thank you for shopping with us!',
    CANCELLED: 'Your order has been cancelled. If you have questions, please contact us.'
  }

  return {
    subject: `Order ${order.code} - Status Update`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Status Update</h2>
        <p>Your order <strong>${order.code}</strong> status has been updated.</p>
        <p><strong>New Status:</strong> ${newStatus}</p>
        <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
        <p>You can track your order anytime using your order code: <strong>${order.code}</strong></p>
      </div>
    `,
    text: `Order ${order.code} status updated to ${newStatus}. ${statusMessages[newStatus] || ''}`
  }
}

export function welcomeEmail(user: any) {
  return {
    subject: 'Welcome to Skin1st Beauty Therapy!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome ${user.name || 'there'}!</h2>
        <p>Thank you for creating an account with Skin1st Beauty Therapy.</p>
        <p>You can now:</p>
        <ul>
          <li>Track your orders</li>
          <li>Save your delivery addresses</li>
          <li>View your order history</li>
          <li>Submit guarantee claims</li>
        </ul>
        <p>Start shopping now and enjoy premium beauty products with fast delivery!</p>
      </div>
    `,
    text: `Welcome to Skin1st Beauty Therapy! Thank you for creating an account.`
  }
}

