require('dotenv').config();
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// Check if environment variables are available
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Environment variables not found!');
  console.error('   Please ensure you have a .env.local file with:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  console.error('   NEXT_PUBLIC_SITE_URL=http://localhost:3000');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testEmailDelivery() {
  console.log('🧪 Testing Email Delivery for Localhost...\n');

  const SETTINGS_UUID = 'ed4ebb8c-40cd-4173-b492-fef97713217b';

  try {
    // 1. Testing SMTP Settings...
    console.log('1. Testing SMTP Settings...');
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

    console.log('✅ Settings found');
    console.log('   SMTP Host:', settings.smtp_host);
    console.log('   SMTP Username:', settings.smtp_username);
    console.log('   From Email:', settings.email_from);
    console.log('   Email Confirmation Enabled:', settings.email_confirmation_enabled);
    console.log('   Signup Subject:', settings.signup_confirmation_subject);
    console.log('   Signup Body Length:', settings.signup_confirmation_body?.length || 0);

    // 2. Testing SMTP connection...
    console.log('\n2. Testing SMTP connection...');
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: Number(settings.smtp_port) || 587,
      secure: !!settings.smtp_secure,
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password,
      },
      // Add timeout and debug options for better error reporting
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
      debug: true,
      logger: true
    });

    try {
      await transporter.verify();
      console.log('✅ SMTP connection successful');
    } catch (verifyError) {
      console.error('❌ SMTP connection failed:', verifyError.message);
      console.error('   Error code:', verifyError.code);
      console.error('   Error command:', verifyError.command);
      
      // Provide specific troubleshooting tips
      if (verifyError.code === 'EAUTH') {
        console.log('\n🔧 Authentication Error - Solutions:');
        console.log('   - For Gmail: Use App Password (not regular password)');
        console.log('   - Enable 2FA and generate App Password');
        console.log('   - Check username/password in admin settings');
      } else if (verifyError.code === 'ECONNECTION') {
        console.log('\n🔧 Connection Error - Solutions:');
        console.log('   - Check SMTP host and port');
        console.log('   - Try port 587 (TLS) or 465 (SSL)');
        console.log('   - Check firewall/network settings');
      } else if (verifyError.code === 'ETIMEDOUT') {
        console.log('\n🔧 Timeout Error - Solutions:');
        console.log('   - Check internet connection');
        console.log('   - Try different SMTP server');
      }
      return;
    }

    // 3. Testing basic email delivery...
    console.log('\n3. Testing basic email delivery...');
    const testEmail = {
      from: settings.email_from_name ? `${settings.email_from_name} <${settings.email_from}>` : settings.email_from,
      to: settings.email_from, // Send to the from email for testing
      subject: 'SMTP Test - ' + new Date().toISOString(),
      text: `This is a test email to verify SMTP configuration.

Configuration:
- Host: ${settings.smtp_host}
- Port: ${settings.smtp_port}
- Username: ${settings.smtp_username}
- Secure: ${settings.smtp_secure}
- From: ${settings.email_from}

Sent at: ${new Date().toISOString()}`,
      html: `<h2>SMTP Test Email</h2>
<p>This is a test email to verify SMTP configuration.</p>
<h3>Configuration:</h3>
<ul>
<li><strong>Host:</strong> ${settings.smtp_host}</li>
<li><strong>Port:</strong> ${settings.smtp_port}</li>
<li><strong>Username:</strong> ${settings.smtp_username}</li>
<li><strong>Secure:</strong> ${settings.smtp_secure}</li>
<li><strong>From:</strong> ${settings.email_from}</li>
</ul>
<p><em>Sent at: ${new Date().toISOString()}</em></p>`
    };

    try {
      const info = await transporter.sendMail(testEmail);
      console.log('✅ Basic email sent successfully!');
      console.log('   Message ID:', info.messageId);
      console.log('   Response:', info.response);
      console.log('   Envelope:', info.envelope);
    } catch (sendError) {
      console.error('❌ Basic email sending failed:', sendError.message);
      console.error('   Error code:', sendError.code);
      console.error('   Error command:', sendError.command);
      console.error('   Full error:', sendError);
      
      // Provide specific troubleshooting tips
      if (sendError.code === 'EAUTH') {
        console.log('\n🔧 Authentication Error - Solutions:');
        console.log('   - For Gmail: Use App Password (not regular password)');
        console.log('   - Enable 2FA and generate App Password');
        console.log('   - Check username/password in admin settings');
      } else if (sendError.code === 'ECONNECTION') {
        console.log('\n🔧 Connection Error - Solutions:');
        console.log('   - Check SMTP host and port');
        console.log('   - Try port 587 (TLS) or 465 (SSL)');
        console.log('   - Check firewall/network settings');
      } else if (sendError.code === 'ETIMEDOUT') {
        console.log('\n🔧 Timeout Error - Solutions:');
        console.log('   - Check internet connection');
        console.log('   - Try different SMTP server');
      } else if (sendError.code === 'EMESSAGE') {
        console.log('\n🔧 Message Error - Solutions:');
        console.log('   - Check "From" email address');
        console.log('   - Verify email format');
        console.log('   - Check email content');
      }
      return;
    }

    // 4. Testing confirmation email template...
    console.log('\n4. Testing confirmation email template...');
    const confirmLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/users/confirm-email?token=test-token-123`;
    const subject = settings.signup_confirmation_subject || 'Confirm your email address';
    let body = settings.signup_confirmation_body || '';
    body = body
      .replace(/\{name\}/g, 'Test User')
      .replace(/\{confirmation_link\}/g, confirmLink)
      .replace(/\{company_name\}/g, settings.site_title || 'Our Company');

    // 5. Testing confirmation email with template...
    console.log('\n5. Testing confirmation email with template...');
    const confirmationEmail = {
      from: settings.email_from_name ? `${settings.email_from_name} <${settings.email_from}>` : settings.email_from,
      to: settings.email_from,
      subject: `[TEST] ${subject}`,
      text: body,
      html: `<pre style="font-family:inherit">${body}</pre>`
    };

    try {
      const info = await transporter.sendMail(confirmationEmail);
      console.log('✅ Confirmation email sent successfully!');
      console.log('   Message ID:', info.messageId);
      console.log('   Subject:', confirmationEmail.subject);
      console.log('   Body Length:', body.length);
      console.log('   Sent to:', confirmationEmail.to);
    } catch (templateError) {
      console.error('❌ Confirmation email template failed:', templateError.message);
      console.error('   Error code:', templateError.code);
      console.error('   Full error:', templateError);
    }

    // 6. Testing API endpoints...
    console.log('\n6. Testing API endpoints...');
    try {
      const publicResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/settings/public`);
      const publicData = await publicResponse.json();
      
      if (publicResponse.ok) {
        console.log('✅ /api/settings/public works');
        console.log('   Email confirmation enabled:', publicData.settings.email_confirmation_enabled);
      } else {
        console.error('❌ /api/settings/public failed:', publicData);
      }
    } catch (apiError) {
      console.error('❌ /api/settings/public error:', apiError.message);
    }

    try {
      const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/request-email-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: settings.email_from }),
      });
      const confirmData = await confirmResponse.json();
      
      if (confirmResponse.ok) {
        console.log('✅ /api/auth/request-email-confirmation works');
        console.log('   Response:', confirmData);
      } else {
        console.error('❌ /api/auth/request-email-confirmation failed:', confirmData);
      }
    } catch (apiError) {
      console.error('❌ /api/auth/request-email-confirmation error:', apiError.message);
    }

    // 7. Checking database tables...
    console.log('\n7. Checking database tables...');
    try {
      const { data: confirmTokens, error: confirmError } = await supabase
        .from('email_confirmation_tokens')
        .select('*')
        .limit(5);
      
      if (confirmError) {
        console.error('❌ email_confirmation_tokens table error:', confirmError);
      } else {
        console.log('✅ email_confirmation_tokens table exists');
        console.log('   Found', confirmTokens.length, 'tokens');
      }
    } catch (tableError) {
      console.error('❌ email_confirmation_tokens table check failed:', tableError.message);
    }

    try {
      const { data: resetTokens, error: resetError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .limit(5);
      
      if (resetError) {
        console.error('❌ password_reset_tokens table error:', resetError);
      } else {
        console.log('✅ password_reset_tokens table exists');
        console.log('   Found', resetTokens.length, 'tokens');
      }
    } catch (tableError) {
      console.error('❌ password_reset_tokens table check failed:', tableError.message);
    }

    console.log('\n🎉 Email delivery test completed successfully!');
    console.log('\n📧 Check your email inbox for the test messages.');
    console.log('\n🔧 If emails are still failing, check:');
    console.log('   1. Spam/junk folder');
    console.log('   2. Email provider settings (Gmail App Password)');
    console.log('   3. SMTP credentials in admin settings');
    console.log('   4. Network connectivity');
    console.log('   5. Firewall settings');

  } catch (error) {
    console.error('❌ Email delivery test failed:', error.message);
    console.error('   Full error:', error);
  }
}

testEmailDelivery(); 