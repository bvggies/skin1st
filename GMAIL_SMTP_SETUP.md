# Gmail SMTP Setup

Gmail SMTP has been configured for email notifications.

## Environment Variables

Add the following to your `.env` file:

```env
EMAIL_SERVICE="smtp"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="bvgkye@gmail.com"
SMTP_PASS="Bvggies@2050"
EMAIL_FROM="bvgkye@gmail.com"
SUPPORT_EMAIL="bvgkye@gmail.com"
```

## Gmail Configuration

### Important Notes

1. **App Password Required**: If your Gmail account has 2-Step Verification enabled, you'll need to use an App Password instead of your regular password.

   To create an App Password:
   - Go to your Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use that 16-character password instead of your regular password

2. **Less Secure Apps**: If 2-Step Verification is not enabled, you may need to enable "Less secure app access" (not recommended for security).

3. **SMTP Settings**:
   - Host: `smtp.gmail.com`
   - Port: `587` (TLS) or `465` (SSL)
   - Secure: `false` for port 587, `true` for port 465
   - Authentication: Required

## Email Features

The following emails will be sent automatically:

- ✅ **Welcome Email**: When users register
- ✅ **Order Confirmation**: When orders are placed
- ✅ **Order Status Updates**: When order status changes

## Testing

To test email sending, you can:
1. Register a new user account
2. Place a test order
3. Check the email inbox for `bvgkye@gmail.com`

## Troubleshooting

### "Invalid login" error
- Make sure you're using an App Password if 2FA is enabled
- Check that "Less secure app access" is enabled if 2FA is disabled

### "Connection timeout" error
- Check your firewall settings
- Verify SMTP port 587 is not blocked

### Emails not received
- Check spam folder
- Verify email addresses are correct
- Check Gmail account for any security alerts

