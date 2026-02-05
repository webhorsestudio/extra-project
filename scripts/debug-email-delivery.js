require('dotenv').config();
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugEmailDelivery() {
  console.log('🔍 Debugging Email Delivery Issues...\n');

  const SETTINGS_UUID = 'ed4ebb8c-40cd-4173-b492-fef97713217b';

  try {
    // 1. Fetch SMTP settings
    console.log('1. Fetching SMTP settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', SETTINGS_UUID)
      .single();

    if (settingsError) {
      console.error('❌ Error fetching settings:', settingsError);
      return;
    }

    if (!settings) {
      console.error('❌ No settings found for UUID:', SETTINGS_UUID);
      return;
    }

    console.log('✅ Settings found:');
    console.log('   SMTP Host:', settings.smtp_host);
    console.log('   SMTP Port:', settings.smtp_port);
    console.log('   SMTP Username:', settings.smtp_username);
    console.log('   SMTP Password:', settings.smtp_password ? '***SET***' : '***NOT SET***');
    console.log('   SMTP Secure:', settings.smtp_secure);
    console.log('   From Email:', settings.email_from);
    console.log('   From Name:', settings.email_from_name);
    console.log('   Email Confirmation Enabled:', settings.email_confirmation_enabled);

    // 2. Validate required fields
    console.log('\n2. Validating required fields...');
    const requiredFields = ['smtp_host', 'smtp_username', 'smtp_password', 'email_from'];
    const missingFields = requiredFields.filter(field => !settings[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return;
    }
    console.log('✅ All required fields present');

    // 3. Test SMTP connection
    console.log('\n3. Testing SMTP connection...');
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: Number(settings.smtp_port) || 587,
      secure: !!settings.smtp_secure,
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password,
      },
      // Add timeout and debug options
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      debug: true,
      logger: true
    });

    try {
      await transporter.verify();
      console.log('✅ SMTP connection successful');
    } catch (verifyError) {
      console.error('❌ SMTP connection failed:', verifyError.message);
      console.error('   Error details:', verifyError);
      return;
    }

    // 4. Test email sending
    console.log('\n4. Testing email sending...');
    const testEmail = {
      from: settings.email_from_name ? `${settings.email_from_name} <${settings.email_from}>` : settings.email_from,
      to: settings.email_from, // Send to the from email for testing
      subject: 'Email Delivery Test - ' + new Date().toISOString(),
      text: `This is a test email to verify SMTP configuration.

Test Details:
- Host: ${settings.smtp_host}
- Port: ${settings.smtp_port}
- Username: ${settings.smtp_username}
- Secure: ${settings.smtp_secure}
- From: ${settings.email_from}

If you receive this email, your SMTP configuration is working correctly.

Sent at: ${new Date().toISOString()}`,
      html: `<h2>Email Delivery Test</h2>
<p>This is a test email to verify SMTP configuration.</p>
<h3>Test Details:</h3>
<ul>
<li><strong>Host:</strong> ${settings.smtp_host}</li>
<li><strong>Port:</strong> ${settings.smtp_port}</li>
<li><strong>Username:</strong> ${settings.smtp_username}</li>
<li><strong>Secure:</strong> ${settings.smtp_secure}</li>
<li><strong>From:</strong> ${settings.email_from}</li>
</ul>
<p>If you receive this email, your SMTP configuration is working correctly.</p>
<p><em>Sent at: ${new Date().toISOString()}</em></p>`
    };

    try {
      const info = await transporter.sendMail(testEmail);
      console.log('✅ Test email sent successfully!');
      console.log('   Message ID:', info.messageId);
      console.log('   Response:', info.response);
      console.log('   Envelope:', info.envelope);
    } catch (sendError) {
      console.error('❌ Test email sending failed:', sendError.message);
      console.error('   Error details:', sendError);
      
      // Provide specific troubleshooting tips
      if (sendError.code === 'EAUTH') {
        console.log('\n🔧 Authentication Error - Common Solutions:');
        console.log('   - Check if username and password are correct');
        console.log('   - For Gmail: Use App Password instead of regular password');
        console.log('   - Enable 2FA and generate App Password');
        console.log('   - Check if "Less secure app access" is enabled (not recommended)');
      } else if (sendError.code === 'ECONNECTION') {
        console.log('\n🔧 Connection Error - Common Solutions:');
        console.log('   - Check if SMTP host and port are correct');
        console.log('   - Verify firewall settings');
        console.log('   - Check if SSL/TLS settings match the port');
        console.log('   - Try different ports: 587 (TLS) or 465 (SSL)');
      } else if (sendError.code === 'ETIMEDOUT') {
        console.log('\n🔧 Timeout Error - Common Solutions:');
        console.log('   - Check internet connection');
        console.log('   - Try different SMTP server');
        console.log('   - Check if SMTP server is accessible');
      }
      return;
    }

    // 5. Test confirmation email template
    console.log('\n5. Testing confirmation email template...');
    const confirmLink = `${settings.website_url || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/users/confirm-email?token=test-token-123`;
    const subject = settings.signup_confirmation_subject || 'Confirm your email address';
    let body = settings.signup_confirmation_body || '';
    body = body
      .replace(/\{name\}/g, 'Test User')
      .replace(/\{confirmation_link\}/g, confirmLink)
      .replace(/\{company_name\}/g, settings.site_title || 'Our Company');

    const confirmationEmail = {
      from: settings.email_from_name ? `${settings.email_from_name} <${settings.email_from}>` : settings.email_from,
      to: settings.email_from,
      subject: `[TEST] ${subject}`,
      text: body,
      html: `<pre style="font-family:inherit">${body}</pre>`
    };

    try {
      const info = await transporter.sendMail(confirmationEmail);
      console.log('✅ Confirmation email template sent successfully!');
      console.log('   Message ID:', info.messageId);
      console.log('   Subject:', confirmationEmail.subject);
      console.log('   Body Length:', body.length);
    } catch (templateError) {
      console.error('❌ Confirmation email template failed:', templateError.message);
    }

    // 6. Check environment variables
    console.log('\n6. Checking environment variables...');
    const envVars = {
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL,
    };

    Object.entries(envVars).forEach(([key, value]) => {
      if (value) {
        console.log(`   ✅ ${key}: ${key.includes('KEY') ? '***SET***' : value}`);
      } else {
        console.log(`   ❌ ${key}: NOT SET`);
      }
    });

    console.log('\n🎉 Email delivery debugging completed!');
    console.log('\n📧 Check your email inbox for the test messages.');
    console.log('\n🔧 If emails are still failing, check:');
    console.log('   1. Spam/junk folder');
    console.log('   2. Email provider settings');
    console.log('   3. SMTP credentials');
    console.log('   4. Network connectivity');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugEmailDelivery(); 