require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Check if environment variables are available
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Environment variables not found!');
  console.error('   Please ensure you have a .env.local file with:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function updateSMTPSettings() {
  console.log('🔧 Updating SMTP Settings in Database...\n');

  const SETTINGS_UUID = 'ed4ebb8c-40cd-4173-b492-fef97713217b';

  // Your verified Gmail SMTP settings
  const smtpSettings = {
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: 'krishnaabhishek7506@gmail.com',
    smtp_password: 'aukg uvjx rsfg gqfw',
    smtp_secure: false,
    email_from: 'no-reply@extrarealtygroup.com',
    email_from_name: 'Extra Realty',
    signup_confirmation_subject: 'Welcome to Extra Realty - Confirm Your Email',
    signup_confirmation_body: `Hello {name},

Thank you for signing up with Extra Realty!

Please confirm your email address by clicking the link below:

{confirmation_link}

If you did not create this account, you can safely ignore this email.

Best regards,
The Extra Realty Team`,
    password_reset_subject: 'Reset Your Password - Extra Realty',
    password_reset_body: `Hello {name},

We received a request to reset your password for your Extra Realty account.

To reset your password, please click the link below:

{reset_link}

This link will expire in 1 hour. If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The Extra Realty Team`,
    email_confirmation_enabled: true // Enable email confirmation
  };

  try {
    // First, check if the settings row exists
    console.log('1. Checking if settings row exists...');
    const { data: existingSettings, error: checkError } = await supabase
      .from('settings')
      .select('id')
      .eq('id', SETTINGS_UUID)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking settings:', checkError);
      return;
    }

    let result;
    if (existingSettings) {
      // Update existing settings
      console.log('2. Updating existing settings...');
      const { data, error } = await supabase
        .from('settings')
        .update(smtpSettings)
        .eq('id', SETTINGS_UUID)
        .select();
      
      if (error) {
        console.error('❌ Error updating settings:', error);
        return;
      }
      result = data[0];
      console.log('✅ Settings updated successfully');
    } else {
      // Create new settings row
      console.log('2. Creating new settings row...');
      const { data, error } = await supabase
        .from('settings')
        .insert({
          id: SETTINGS_UUID,
          ...smtpSettings
        })
        .select();
      
      if (error) {
        console.error('❌ Error creating settings:', error);
        return;
      }
      result = data[0];
      console.log('✅ Settings created successfully');
    }

    // Verify the settings were saved correctly
    console.log('\n3. Verifying saved settings...');
    const { data: verifySettings, error: verifyError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', SETTINGS_UUID)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying settings:', verifyError);
      return;
    }

    console.log('✅ Settings verified successfully:');
    console.log('   SMTP Host:', verifySettings.smtp_host);
    console.log('   SMTP Port:', verifySettings.smtp_port);
    console.log('   SMTP Username:', verifySettings.smtp_username);
    console.log('   SMTP Password:', verifySettings.smtp_password ? '***SET***' : '***NOT SET***');
    console.log('   SMTP Secure:', verifySettings.smtp_secure);
    console.log('   From Email:', verifySettings.email_from);
    console.log('   From Name:', verifySettings.email_from_name);
    console.log('   Email Confirmation Enabled:', verifySettings.email_confirmation_enabled);
    console.log('   Signup Subject:', verifySettings.signup_confirmation_subject);
    console.log('   Signup Body Length:', verifySettings.signup_confirmation_body?.length || 0);

    console.log('\n🎉 SMTP settings updated successfully!');
    console.log('\n🔧 Next steps:');
    console.log('   1. Go to your admin panel: http://localhost:3000/admin/settings');
    console.log('   2. Verify the settings are displayed correctly');
    console.log('   3. Test the "Test Connection" button');
    console.log('   4. Register a new user to test email confirmation');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateSMTPSettings(); 