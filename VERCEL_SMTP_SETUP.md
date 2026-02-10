# Vercel SMTP Setup - Quick Reference

## Environment Variables to Set in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables (select **all environments**: Production, Preview, Development):

```
EMAIL_SERVICE=zoho
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@skin1stbeauty.com
SMTP_PASS=KCcwxEj1LAux
EMAIL_FROM=info@skin1stbeauty.com
EMAIL_FROM_NAME=Skin1st Beauty Therapy
EMAIL_REPLY_TO=info@skin1stbeauty.com
SUPPORT_EMAIL=info@skin1stbeauty.com
COMPANY_EMAIL=info@skin1stbeauty.com
```

## Steps:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (skin1st)
3. **Settings** → **Environment Variables**
4. **Add each variable** one by one:
   - Click **Add New**
   - Enter **Key** (e.g., `EMAIL_SERVICE`)
   - Enter **Value** (e.g., `zoho`)
   - Select **all environments** (Production, Preview, Development)
   - Click **Save**
   - Repeat for each variable above

5. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**

## Important Notes:

- ✅ The password above is your Zoho App-Specific Password
- ✅ Never commit passwords to git
- ✅ After adding variables, you MUST redeploy for changes to take effect
- ✅ Test by placing an order - check email inbox and Vercel logs

## Verification:

After redeploying, check Vercel function logs:
- Should see: `✅ Email sent successfully to: <email>`
- If you see errors, check the logs for details
