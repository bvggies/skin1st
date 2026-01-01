#!/usr/bin/env node

/**
 * Generate secure random secrets for JWT tokens
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto')

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64')
}

console.log('🔐 Generating secure JWT secrets...\n')
console.log('Copy these to your .env file:\n')
console.log('JWT_ACCESS_SECRET="' + generateSecret() + '"')
console.log('JWT_REFRESH_SECRET="' + generateSecret() + '"')
console.log('\n✅ Secrets generated! Make sure to keep them secure.')

