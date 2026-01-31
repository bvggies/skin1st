# Zoho Email Setup Guide

This guide explains how to configure Zoho Mail for sending emails from your Skin1st Beauty Therapy application.

## Prerequisites

- Zoho Mail account with email: `info@skin1stbeauty.com`
- Access to Zoho Mail settings

## Step 1: Enable App-Specific Password in Zoho

1. Log in to your Zoho Mail account
2. Go to **Settings** → **Security** → **App Passwords**
3. Click **Generate New Password**
4. Give it a name (e.g., "Skin1st App")
5. Copy the generated password (you'll need this for the SMTP_PASS variable)

**Important:** You cannot use your regular Zoho password. You must use an App-Specific Password.

## Step 2: Zoho SMTP Settings

- **SMTP Host:** `smtp.zoho.com`
- **SMTP Port:** `587` (TLS) or `465` (SSL)
- **SMTP User:** `info@skin1stbeauty.com`
- **SMTP Pass:** Your App-Specific Password from Step 1
- **Security:** TLS (for port 587) or SSL (for port 465)

## Step 3: Vercel Environment Variables

Add these environment variables in your Vercel project settings:

### Required Variables:

```bash
# Email Service Configuration
EMAIL_SERVICE=zoho

# Zoho SMTP Settings
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@skin1stbeauty.com
SMTP_PASS=your_app_specific_password_here

# Email Addresses
EMAIL_FROM=info@skin1stbeauty.com
EMAIL_REPLY_TO=info@skin1stbeauty.com
SUPPORT_EMAIL=info@skin1stbeauty.com
COMPANY_EMAIL=info@skin1stbeauty.com
```

### How to Add in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable above:
   - **Key:** The variable name (e.g., `EMAIL_SERVICE`)
   - **Value:** The variable value (e.g., `zoho`)
   - **Environment:** Select all (Production, Preview, Development)
4. Click **Save**

## Step 4: Test Email Configuration

After deploying, test the email functionality by:
1. Creating a new user account (should send welcome email)
2. Placing an order (should send order confirmation email)
3. Updating an order status (should send status update email)

## Troubleshooting

### Email Not Sending

1. **Check App Password:** Ensure you're using an App-Specific Password, not your regular Zoho password
2. **Check Port:** Try port `465` with `SMTP_SECURE=true` if port `587` doesn't work
3. **Check Firewall:** Ensure Vercel's IPs aren't blocked by Zoho
4. **Check Logs:** Check Vercel function logs for error messages

### Common Errors

- **"Invalid login"**: Check that SMTP_USER and SMTP_PASS are correct
- **"Connection timeout"**: Try port 465 with SMTP_SECURE=true
- **"Authentication failed"**: Ensure you're using an App-Specific Password

## Email Templates

The application sends the following emails:

1. **Welcome Email** - When a user registers
2. **Order Confirmation** - When an order is placed
3. **Order Status Update** - When order status changes
4. **Contact Form** - When someone submits the contact form

All emails are sent from `info@skin1stbeauty.com` and can be replied to at the same address.

## Security Notes

- Never commit your App-Specific Password to git
- Keep your App-Specific Password secure
- Rotate passwords periodically
- Use different App Passwords for different environments if needed
