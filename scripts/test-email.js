const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testEmailSetup() {
  console.log('🔍 Testing Email Setup...\n');

  try {
    // 1. Fetch SMTP settings from database
    console.log('1. Fetching SMTP settings from database...');
    const SETTINGS_UUID = 'ed4ebb8c-40cd-4173-b492-fef97713217b';
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', SETTINGS_UUID)
      .single();

    if (error) {
      console.error('❌ Error fetching settings:', error.message);
      return;
    }

    if (!settings) {
      console.error('❌ No settings found with UUID:', SETTINGS_UUID);
      return;
    }

    console.log('✅ Settings found');
    console.log('   SMTP Host:', settings.smtp_host || 'Not configured');
    console.log('   SMTP Port:', settings.smtp_port || 'Not configured');
    console.log('   SMTP Username:', settings.smtp_username || 'Not configured');
    console.log('   From Email:', settings.email_from || 'Not configured');
    console.log('   Email Confirmation Enabled:', settings.email_confirmation_enabled);

    // 2. Check if SMTP is configured
    if (!settings.smtp_host || !settings.smtp_username || !settings.smtp_password || !settings.email_from) {
      console.error('\n❌ SMTP settings not fully configured!');
      console.log('\n📝 Please configure SMTP settings in the admin panel:');
      console.log('   - Go to /admin/settings/smtp');
      console.log('   - Fill in all required fields');
      console.log('   - Save the settings');
      return;
    }

    // 3. Test SMTP connection
    console.log('\n2. Testing SMTP connection...');
    const transporter = nodemailer.createTransporter({
      host: settings.smtp_host,
      port: Number(settings.smtp_port) || 587,
      secure: !!settings.smtp_secure,
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful');

    // 4. Send test email
    console.log('\n3. Sending test email...');
    const testEmail = {
      from: settings.email_from_name ? `${settings.email_from_name} <${settings.email_from}>` : settings.email_from,
      to: settings.email_from, // Send to the configured from email
      subject: '🧪 Email Setup Test - Property App',
      text: `This is a test email to verify your SMTP configuration.

Email Configuration:
- SMTP Host: ${settings.smtp_host}
- SMTP Port: ${settings.smtp_port}
- From Email: ${settings.email_from}
- From Name: ${settings.email_from_name || 'Not set'}

If you receive this email, your SMTP configuration is working correctly!

Best regards,
Your Property App`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🧪 Email Setup Test - Property App</h2>
          <p>This is a test email to verify your SMTP configuration.</p>
          
          <h3 style="color: #666;">Email Configuration:</h3>
          <ul>
            <li><strong>SMTP Host:</strong> ${settings.smtp_host}</li>
            <li><strong>SMTP Port:</strong> ${settings.smtp_port}</li>
            <li><strong>From Email:</strong> ${settings.email_from}</li>
            <li><strong>From Name:</strong> ${settings.email_from_name || 'Not set'}</li>
          </ul>
          
          <p style="color: green; font-weight: bold;">✅ If you receive this email, your SMTP configuration is working correctly!</p>
          
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Best regards,<br>
            Your Property App
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Sent to:', testEmail.to);

    // 5. Check email confirmation tokens table
    console.log('\n4. Checking email confirmation tokens table...');
    const { data: tokens, error: tokensError } = await supabase
      .from('email_confirmation_tokens')
      .select('*')
      .limit(5);

    if (tokensError) {
      console.log('⚠️  Email confirmation tokens table not found or accessible');
    } else {
      console.log('✅ Email confirmation tokens table exists');
      console.log('   Found', tokens.length, 'tokens');
    }

    // 6. Check password reset tokens table
    console.log('\n5. Checking password reset tokens table...');
    const { data: resetTokens, error: resetTokensError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .limit(5);

    if (resetTokensError) {
      console.log('⚠️  Password reset tokens table not found or accessible');
    } else {
      console.log('✅ Password reset tokens table exists');
      console.log('   Found', resetTokens.length, 'tokens');
    }

    console.log('\n🎉 Email setup test completed successfully!');
    console.log('\n📧 Check your email inbox for the test message.');
    console.log('\n🔧 Next steps:');
    console.log('   1. Test user registration with email confirmation');
    console.log('   2. Test password reset functionality');
    console.log('   3. Monitor email delivery in your inbox');

  } catch (error) {
    console.error('\n❌ Email setup test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication failed. Please check:');
      console.log('   - SMTP username and password are correct');
      console.log('   - For Gmail: Use App Password, not regular password');
      console.log('   - 2-Factor Authentication is enabled for Gmail');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 Connection failed. Please check:');
      console.log('   - SMTP host and port are correct');
      console.log('   - Internet connection is working');
      console.log('   - Firewall is not blocking the connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n🔧 Connection timeout. Please check:');
      console.log('   - SMTP host is correct');
      console.log('   - Try different ports (587, 465, 25)');
    }
  }
}

// Run the test
testEmailSetup(); 