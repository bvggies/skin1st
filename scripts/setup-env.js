#!/usr/bin/env node

/**
 * Interactive script to help set up .env file
 * Usage: node scripts/setup-env.js
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const crypto = require('crypto')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

function generateSecret() {
  return crypto.randomBytes(64).toString('base64')
}

async function main() {
  console.log('🚀 Environment Setup Helper\n')
  console.log('This script will help you create a .env file.\n')

  const envPath = path.join(__dirname, '..', '.env')
  const examplePath = path.join(__dirname, '..', '.env.example')

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ')
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Cancelled.')
      rl.close()
      return
    }
  }

  // Check if .env.example exists
  let template = ''
  if (fs.existsSync(examplePath)) {
    template = fs.readFileSync(examplePath, 'utf8')
  } else {
    // Create basic template
    template = `# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# JWT Authentication Secrets
JWT_ACCESS_SECRET="${generateSecret()}"
JWT_REFRESH_SECRET="${generateSecret()}"

# Application URLs
CLIENT_URL="http://localhost:3000"

# Email Configuration
EMAIL_SERVICE="console"
EMAIL_FROM="noreply@skin1st.com"
SUPPORT_EMAIL="support@skin1st.com"

# WhatsApp Integration
WHATSAPP_WEBHOOK_URL=""
REACT_APP_WHATSAPP_NUMBER="+1234567890"

# Frontend
REACT_APP_API_URL="/api"

# Image Upload (Optional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Error Tracking (Optional)
SENTRY_DSN=""

# Node Environment
NODE_ENV="development"
`
  }

  console.log('\n📝 Please provide the following information:\n')

  // Database URL
  const dbUrl = await question('Database URL (PostgreSQL): ')
  if (dbUrl) {
    template = template.replace(
      /DATABASE_URL=".*"/,
      `DATABASE_URL="${dbUrl}"`
    )
  }

  // Generate JWT secrets if not already in template
  if (!template.includes('JWT_ACCESS_SECRET') || template.includes('your-super-secret')) {
    const generateJWT = await question('Generate JWT secrets automatically? (Y/n): ')
    if (generateJWT.toLowerCase() !== 'n') {
      template = template.replace(
        /JWT_ACCESS_SECRET=".*"/,
        `JWT_ACCESS_SECRET="${generateSecret()}"`
      )
      template = template.replace(
        /JWT_REFRESH_SECRET=".*"/,
        `JWT_REFRESH_SECRET="${generateSecret()}"`
      )
      console.log('✅ JWT secrets generated automatically')
    }
  }

  // Client URL
  const clientUrl = await question('Client URL (default: http://localhost:3000): ')
  if (clientUrl) {
    template = template.replace(
      /CLIENT_URL=".*"/,
      `CLIENT_URL="${clientUrl}"`
    )
  }

  // WhatsApp Number
  const whatsapp = await question('WhatsApp Number (format: +1234567890): ')
  if (whatsapp) {
    template = template.replace(
      /REACT_APP_WHATSAPP_NUMBER=".*"/,
      `REACT_APP_WHATSAPP_NUMBER="${whatsapp}"`
    )
  }

  // Email service
  const emailService = await question('Email Service (console/sendgrid/mailgun/smtp, default: console): ')
  if (emailService && emailService !== 'console') {
    template = template.replace(
      /EMAIL_SERVICE=".*"/,
      `EMAIL_SERVICE="${emailService}"`
    )

    if (emailService === 'sendgrid') {
      const apiKey = await question('SendGrid API Key: ')
      if (apiKey) {
        template += `\nSENDGRID_API_KEY="${apiKey}"`
      }
    } else if (emailService === 'mailgun') {
      const apiKey = await question('Mailgun API Key: ')
      const domain = await question('Mailgun Domain: ')
      if (apiKey) template += `\nMAILGUN_API_KEY="${apiKey}"`
      if (domain) template += `\nMAILGUN_DOMAIN="${domain}"`
    } else if (emailService === 'smtp') {
      const host = await question('SMTP Host: ')
      const port = await question('SMTP Port (default: 587): ') || '587'
      const user = await question('SMTP User: ')
      const pass = await question('SMTP Password: ')
      if (host) template += `\nSMTP_HOST="${host}"`
      if (port) template += `\nSMTP_PORT="${port}"`
      if (user) template += `\nSMTP_USER="${user}"`
      if (pass) template += `\nSMTP_PASS="${pass}"`
    }
  }

  // Write .env file
  fs.writeFileSync(envPath, template)
  console.log('\n✅ .env file created successfully!')
  console.log(`📁 Location: ${envPath}\n`)
  console.log('⚠️  Please review the .env file and update any remaining values.')
  console.log('⚠️  Never commit .env to version control!\n')

  rl.close()
}

main().catch(console.error)

