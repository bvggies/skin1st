# SMTP Authentication Error Fix Guide

## Error
```
SMTP connection verification failed: Error: Invalid login: 535 Authentication Failed
```

## What This Means
The SMTP credentials (username/password) configured in Vercel are incorrect or missing.

## Solution

### Option 1: Use Console Mode (Development/Testing)
If you don't need emails right now, set `EMAIL_SERVICE=console` in Vercel. Emails will be logged to console instead of being sent.

### Option 2: Fix SMTP Credentials (Production)

#### For Zoho Mail:
1. **Get App-Specific Password:**
   - Log in to Zoho Mail: https://mail.zoho.com
   - Go to **Settings** → **Security** → **App Passwords**
   - Click **Generate New Password**
   - Name it: "Skin1st Vercel"
   - Copy the generated password (16 characters)

2. **Update Vercel Environment Variables:**
   Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   
   Set these values:
   ```
   EMAIL_SERVICE=zoho
   SMTP_HOST=smtp.zoho.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=info@skin1stbeauty.com
   SMTP_PASS=<your-app-specific-password-here>
   EMAIL_FROM=info@skin1stbeauty.com
   EMAIL_REPLY_TO=info@skin1stbeauty.com
   SUPPORT_EMAIL=info@skin1stbeauty.com
   ```

#### For Gmail:
1. **Enable 2-Step Verification** (if not already enabled)
2. **Create App Password:**
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password

3. **Update Vercel Environment Variables:**
   ```
   EMAIL_SERVICE=zoho
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=<your-app-password-here>
   EMAIL_FROM=your-email@gmail.com
   ```

#### For Other SMTP Providers:
Update the variables accordingly:
- `SMTP_HOST`: Your SMTP server (e.g., smtp.mailgun.org, smtp.sendgrid.net)
- `SMTP_PORT`: Usually 587 (TLS) or 465 (SSL)
- `SMTP_SECURE`: `false` for port 587, `true` for port 465
- `SMTP_USER`: Your SMTP username/email
- `SMTP_PASS`: Your SMTP password or app-specific password

### Option 3: Use Email Service APIs (Recommended for Production)

#### SendGrid:
```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=<your-api-key>
EMAIL_FROM=noreply@skin1stbeauty.com
```

#### Mailgun:
```
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=<your-api-key>
MAILGUN_DOMAIN=<your-domain>
EMAIL_FROM=noreply@skin1stbeauty.com
```

## Important Notes

1. **Never use your regular email password** - Always use app-specific passwords for SMTP
2. **Redeploy after changing environment variables** - Vercel needs a new deployment to pick up changes
3. **Email failures won't break orders** - The app now handles email errors gracefully and won't fail order creation if email fails
4. **Check logs** - Email attempts are logged in Vercel function logs

## Testing

After updating credentials and redeploying:
1. Place a test order
2. Check Vercel function logs for email status
3. Check the recipient's inbox (and spam folder)

## Current Behavior

The app now handles SMTP errors gracefully:
- ✅ Orders will still be created even if email fails
- ✅ Email errors are logged but don't break the flow
- ✅ Falls back to console logging if SMTP is not configured
- ✅ Verification failures are logged but don't prevent sending
