# Vercel Environment Variables for Zoho Email

## Required Environment Variables

Add these environment variables in your Vercel project settings:

### Email Service Configuration

```bash
EMAIL_SERVICE=zoho
```

### Zoho SMTP Settings

```bash
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@skin1stbeauty.com
SMTP_PASS=YOUR_ZOHO_APP_PASSWORD_HERE
```

**Important:** Replace `YOUR_ZOHO_APP_PASSWORD_HERE` with your actual Zoho App-Specific Password.

### Email Addresses

```bash
EMAIL_FROM=info@skin1stbeauty.com
EMAIL_REPLY_TO=info@skin1stbeauty.com
SUPPORT_EMAIL=info@skin1stbeauty.com
COMPANY_EMAIL=info@skin1stbeauty.com
```

## How to Add in Vercel Dashboard

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project (skin1st)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. For each variable:
   - **Key:** Enter the variable name (e.g., `EMAIL_SERVICE`)
   - **Value:** Enter the variable value (e.g., `zoho`)
   - **Environment:** Select all environments (Production, Preview, Development)
   - Click **Save**

## Complete List (Copy-Paste Ready)

Add these one by one in Vercel:

```
EMAIL_SERVICE=zoho
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@skin1stbeauty.com
SMTP_PASS=YOUR_ZOHO_APP_PASSWORD_HERE
EMAIL_FROM=info@skin1stbeauty.com
EMAIL_REPLY_TO=info@skin1stbeauty.com
SUPPORT_EMAIL=info@skin1stbeauty.com
COMPANY_EMAIL=info@skin1stbeauty.com
```

## Getting Your Zoho App Password

1. Log in to Zoho Mail: https://mail.zoho.com
2. Go to **Settings** (gear icon) → **Security**
3. Scroll to **App Passwords** section
4. Click **Generate New Password**
5. Give it a name: "Skin1st Vercel App"
6. Copy the generated password
7. Use this password for `SMTP_PASS` in Vercel

## Alternative: Port 465 (SSL)

If port 587 doesn't work, try port 465 with SSL:

```bash
SMTP_PORT=465
SMTP_SECURE=true
```

## Testing

After adding the variables and redeploying:

1. **Test Welcome Email:** Register a new user account
2. **Test Order Email:** Place a test order
3. **Test Status Update:** Update an order status in admin panel
4. **Test Contact Form:** Submit the contact form

## Troubleshooting

### Email Not Sending

- Check Vercel function logs for errors
- Verify App Password is correct (not your regular password)
- Try port 465 with SMTP_SECURE=true
- Check that EMAIL_FROM matches SMTP_USER

### Common Errors

- **"Invalid login"**: Wrong App Password or SMTP_USER
- **"Connection timeout"**: Try port 465
- **"Authentication failed"**: Must use App-Specific Password, not regular password

## Security Notes

- ✅ App Passwords are secure and can be revoked
- ✅ Never commit passwords to git
- ✅ Use different App Passwords for different environments if needed
- ✅ Rotate passwords periodically
