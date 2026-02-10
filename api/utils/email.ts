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
    case 'zoho':
      // SMTP implementation using nodemailer (supports Zoho, Gmail, etc.)
      const nodemailer = require('nodemailer')
      const isSecure = process.env.SMTP_SECURE === 'true'
      const port = parseInt(process.env.SMTP_PORT || '587')
      const smtpUser = process.env.SMTP_USER || process.env.EMAIL_FROM
      const smtpPass = process.env.SMTP_PASS
      
      // Check if SMTP credentials are configured
      if (!smtpUser || !smtpPass) {
        console.warn('⚠️ SMTP credentials not configured. Falling back to console mode.')
        console.log('📧 Email would be sent:')
        console.log('To:', options.to)
        console.log('Subject:', options.subject)
        console.log('Body:', options.text || options.html)
        return
      }
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.zoho.com',
        port: port,
        secure: isSecure, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        // For Zoho and other services that require TLS
        ...(port === 587 && !isSecure && {
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false // Allow self-signed certificates if needed
          }
        })
      })
      
      // Verify connection configuration (non-blocking - log warning but continue)
      try {
        await transporter.verify()
      } catch (error: any) {
        console.error('⚠️ SMTP connection verification failed:', error?.message || error)
        console.error('SMTP Config:', {
          host: process.env.SMTP_HOST || 'smtp.zoho.com',
          port: port,
          secure: isSecure,
          user: smtpUser?.substring(0, 3) + '***' // Mask password
        })
        // Don't throw - allow sending to proceed (some servers don't support verify)
        console.warn('⚠️ Continuing with email send despite verification failure...')
      }
      
      // Attempt to send email
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || smtpUser || 'info@skin1stbeauty.com',
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
          replyTo: process.env.EMAIL_REPLY_TO || process.env.SUPPORT_EMAIL || 'info@skin1stbeauty.com'
        })
        console.log('✅ Email sent successfully to:', options.to)
        return
      } catch (sendError: any) {
        console.error('❌ Failed to send email:', sendError?.message || sendError)
        console.error('Email details:', {
          to: options.to,
          subject: options.subject,
          errorCode: sendError?.code,
          response: sendError?.response
        })
        // Don't throw - email failures shouldn't break the application
        // Log to console as fallback
        console.log('📧 Email would have been sent:')
        console.log('To:', options.to)
        console.log('Subject:', options.subject)
        console.log('Body:', options.text || options.html)
        return
      }

    default:
      throw new Error(`Unknown email service: ${emailService}`)
  }
}

// Email templates
export function orderConfirmationEmail(order: any, items: any[]) {
  const total = (order.total / 100).toFixed(2)
  const trackingCode = order.trackingCode || order.code
  return {
    subject: `Order Confirmation - ${order.code} | Skin1st Beauty Therapy`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #1a1a2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Skin1st Beauty Therapy</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1a1a2e; margin-top: 0;">Thank you for your order!</h2>
          <p style="color: #666; line-height: 1.6;">Your order <strong style="color: #e94560;">${order.code}</strong> has been received and is being processed.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #1a1a2e;"><strong>Tracking Code:</strong> <span style="color: #e94560; font-family: monospace;">${trackingCode}</span></p>
          </div>
          
          <h3 style="color: #1a1a2e; border-bottom: 2px solid #e94560; padding-bottom: 10px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0;">Item</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e0e0e0;">Quantity</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e0e0e0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${item.variant?.product?.name || 'Product'}${item.variant?.name && item.variant.name !== item.variant?.product?.name ? ` - ${item.variant.name}` : ''}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #666;">× ${item.quantity}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #333;">₵${(item.unitPrice / 100).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr style="background-color: #f9fafb; font-weight: bold;">
                <td colspan="2" style="padding: 12px; border-top: 2px solid #e0e0e0; color: #1a1a2e;">Total</td>
                <td style="padding: 12px; text-align: right; border-top: 2px solid #e0e0e0; color: #e94560; font-size: 18px;">₵${total}</td>
              </tr>
            </tbody>
          </table>
          
          <h3 style="color: #1a1a2e; border-bottom: 2px solid #e94560; padding-bottom: 10px; margin-top: 30px;">Delivery Address</h3>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; line-height: 1.8; color: #333;">
            <p style="margin: 0;">${order.deliveryAddr}</p>
            ${order.area ? `<p style="margin: 5px 0 0 0;">${order.area}</p>` : ''}
            ${order.city ? `<p style="margin: 5px 0 0 0;">${order.city}</p>` : ''}
            ${order.region ? `<p style="margin: 5px 0 0 0;">${order.region}</p>` : ''}
            ${order.landmark ? `<p style="margin: 5px 0 0 0;"><strong>Landmark:</strong> ${order.landmark}</p>` : ''}
          </div>
          
          <div style="background-color: #e94560; color: #ffffff; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-weight: bold;">We'll contact you shortly to confirm your order!</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">You can track your order anytime using your tracking code: <strong style="color: #1a1a2e;">${trackingCode}</strong></p>
          
          <p style="color: #666; line-height: 1.6; margin-top: 20px;">Thank you for shopping with <strong style="color: #1a1a2e;">Skin1st Beauty Therapy</strong>!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">Questions? Contact us at info@skin1stbeauty.com</p>
          </div>
        </div>
      </div>
    `,
    text: `Thank you for your order ${order.code}!\n\nTracking Code: ${trackingCode}\nTotal: ₵${total}\n\nWe'll contact you shortly to confirm your order.\n\nThank you for shopping with Skin1st Beauty Therapy!`
  }
}

export function orderStatusUpdateEmail(order: any, newStatus: string) {
  const statusMessages: Record<string, string> = {
    CONFIRMED: 'Your order has been confirmed and is being prepared for shipment.',
    OUT_FOR_DELIVERY: 'Great news! Your order is out for delivery. We\'ll contact you soon to coordinate delivery.',
    DELIVERED: 'Your order has been successfully delivered! We hope you enjoy your products.',
    PAID: 'Payment has been received. Thank you!',
    COMPLETED: 'Your order has been completed successfully. Thank you for shopping with us!',
    CANCELLED: 'Your order has been cancelled. If you have any questions, please contact us at info@skin1stbeauty.com.'
  }

  const statusColors: Record<string, string> = {
    CONFIRMED: '#10b981',
    OUT_FOR_DELIVERY: '#6366f1',
    DELIVERED: '#10b981',
    PAID: '#10b981',
    COMPLETED: '#10b981',
    CANCELLED: '#ef4444'
  }

  const statusColor = statusColors[newStatus] || '#6366f1'
  const trackingCode = order.trackingCode || order.code

  return {
    subject: `Order ${order.code} - Status Update: ${newStatus.replace(/_/g, ' ')} | Skin1st Beauty Therapy`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #1a1a2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Skin1st Beauty Therapy</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1a1a2e; margin-top: 0;">Order Status Update</h2>
          <p style="color: #666; line-height: 1.6;">Your order <strong style="color: #e94560;">${order.code}</strong> status has been updated.</p>
          
          <div style="background-color: ${statusColor}15; border-left: 4px solid ${statusColor}; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #1a1a2e;"><strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: capitalize;">${newStatus.replace(/_/g, ' ')}</span></p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin: 20px 0;">${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #1a1a2e;"><strong>Order Code:</strong> <span style="color: #e94560; font-family: monospace;">${order.code}</span></p>
            <p style="margin: 5px 0 0 0; color: #1a1a2e;"><strong>Tracking Code:</strong> <span style="color: #e94560; font-family: monospace;">${trackingCode}</span></p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 20px;">You can track your order anytime using your tracking code: <strong style="color: #1a1a2e;">${trackingCode}</strong></p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">Questions? Contact us at info@skin1stbeauty.com</p>
          </div>
        </div>
      </div>
    `,
    text: `Order ${order.code} Status Update\n\nNew Status: ${newStatus.replace(/_/g, ' ')}\n\n${statusMessages[newStatus] || 'Your order status has been updated.'}\n\nTracking Code: ${trackingCode}\n\nYou can track your order anytime using your tracking code: ${trackingCode}`
  }
}

export function welcomeEmail(user: any) {
  return {
    subject: 'Welcome to Skin1st Beauty Therapy!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #1a1a2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Skin1st Beauty Therapy</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1a1a2e; margin-top: 0;">Welcome ${user.name || 'there'}!</h2>
          <p style="color: #666; line-height: 1.6;">Thank you for creating an account with <strong style="color: #1a1a2e;">Skin1st Beauty Therapy</strong>!</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 15px 0; color: #1a1a2e; font-weight: bold;">With your account, you can now:</p>
            <ul style="margin: 0; padding-left: 20px; color: #666; line-height: 2;">
              <li>Track your orders in real-time</li>
              <li>Save multiple delivery addresses</li>
              <li>View your complete order history</li>
              <li>Submit money-back guarantee claims</li>
              <li>Manage your wishlist</li>
              <li>Receive exclusive offers and updates</li>
            </ul>
          </div>
          
          <div style="background-color: #e94560; color: #ffffff; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-weight: bold;">Start shopping now and enjoy premium beauty products with fast delivery!</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 20px;">We're excited to have you as part of the Skin1st Beauty Therapy family!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">Questions? Contact us at info@skin1stbeauty.com</p>
          </div>
        </div>
      </div>
    `,
    text: `Welcome to Skin1st Beauty Therapy!\n\nThank you for creating an account, ${user.name || 'there'}!\n\nWith your account, you can now:\n- Track your orders in real-time\n- Save multiple delivery addresses\n- View your complete order history\n- Submit money-back guarantee claims\n- Manage your wishlist\n- Receive exclusive offers and updates\n\nStart shopping now and enjoy premium beauty products with fast delivery!\n\nQuestions? Contact us at info@skin1stbeauty.com`
  }
}

