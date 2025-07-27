# Email Delivery Setup Guide for Localhost

## Overview
This guide will help you set up email delivery for your application running on localhost. There are several options available depending on your needs.

## Option 1: Gmail SMTP (Recommended for Testing)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. Go to Google Account → Security → 2-Step Verification
2. Click "App passwords" at the bottom
3. Select "Mail" and "Other (Custom name)"
4. Enter a name like "Property App"
5. Copy the generated 16-character password

### Step 3: Configure SMTP Settings in Admin Panel
Go to `/admin/settings/smtp` and configure:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: your-email@gmail.com
SMTP Password: [Your 16-character app password]
Use SSL/TLS: ✅ (checked)
From Email: your-email@gmail.com
From Name: Your Company Name
```

### Step 4: Test Configuration
1. Click "Test Connection" button in the admin panel
2. Check your email for the test message

## Option 2: Mailtrap (Development/Testing)

### Step 1: Create Mailtrap Account
1. Go to [mailtrap.io](https://mailtrap.io)
2. Sign up for a free account
3. Create a new inbox

### Step 2: Get SMTP Credentials
1. Go to your inbox settings
2. Select "SMTP Settings"
3. Copy the credentials

### Step 3: Configure SMTP Settings
```
SMTP Host: [From Mailtrap]
SMTP Port: [From Mailtrap]
SMTP Username: [From Mailtrap]
SMTP Password: [From Mailtrap]
Use SSL/TLS: ✅ (checked)
From Email: noreply@yourdomain.com
From Name: Your Company Name
```

## Option 3: SendGrid (Production Ready)

### Step 1: Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day)

### Step 2: Create API Key
1. Go to Settings → API Keys
2. Create a new API Key with "Mail Send" permissions
3. Copy the API key

### Step 3: Configure SMTP Settings
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [Your SendGrid API Key]
Use SSL/TLS: ✅ (checked)
From Email: verified-sender@yourdomain.com
From Name: Your Company Name
```

## Option 4: Local Email Testing with Ethereal

For development without sending real emails:

### Step 1: Create Test Account
```javascript
// This creates a fake SMTP account for testing
const testAccount = await nodemailer.createTestAccount();
```

### Step 2: Configure SMTP Settings
```
SMTP Host: smtp.ethereal.email
SMTP Port: 587
SMTP Username: [From test account]
SMTP Password: [From test account]
Use SSL/TLS: ❌ (unchecked)
From Email: test@ethereal.email
From Name: Test Account
```

## Email Templates Setup

### Signup Confirmation Email Template
**Subject:** `Welcome to {company_name} - Confirm Your Email`

**Body:**
```
Hello {name},

Thank you for signing up with {company_name}! Please confirm your email address by clicking the link below:

{confirmation_link}

If you didn't create this account, you can safely ignore this email.

Best regards,
The {company_name} Team
```

### Password Reset Email Template
**Subject:** `Reset Your Password - {company_name}`

**Body:**
```
Hello {name},

You requested to reset your password. Click the link below to create a new password:

{reset_link}

This link will expire in 1 hour. If you didn't request this password reset, you can safely ignore this email.

Best regards,
The {company_name} Team
```

## Troubleshooting

### Common Issues:

1. **"SMTP settings not configured"**
   - Make sure you've saved SMTP settings in the admin panel
   - Check that all required fields are filled

2. **"Authentication failed"**
   - Verify your username and password
   - For Gmail, make sure you're using an App Password, not your regular password
   - Check if 2FA is enabled for Gmail

3. **"Connection timeout"**
   - Check your internet connection
   - Verify the SMTP host and port are correct
   - Try different ports (587, 465, 25)

4. **"Emails not received"**
   - Check spam/junk folder
   - Verify the "From Email" address is correct
   - For Gmail, make sure the sender email matches your Gmail address

### Testing Steps:

1. **Test SMTP Connection**
   - Use the "Test Connection" button in admin panel
   - Check for any error messages

2. **Test Registration Flow**
   - Register a new user with email confirmation enabled
   - Check if confirmation email is sent

3. **Test Password Reset**
   - Request a password reset
   - Check if reset email is sent

4. **Check Email Logs**
   - Look at your email provider's logs
   - Check application console for error messages

## Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Security Notes

1. **Never commit SMTP passwords to version control**
2. **Use environment variables for sensitive data**
3. **Enable 2FA on your email accounts**
4. **Use App Passwords instead of regular passwords**
5. **Regularly rotate your SMTP credentials**

## Next Steps

1. Choose an SMTP provider from the options above
2. Configure the settings in your admin panel
3. Test the connection
4. Test the registration and password reset flows
5. Monitor email delivery and troubleshoot any issues 