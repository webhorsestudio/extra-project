require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSettings() {
  console.log('🔍 Checking email confirmation setting...');
  
  const SETTINGS_UUID = 'ed4ebb8c-40cd-4173-b492-fef97713217b';
  
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('email_confirmation_enabled, smtp_host, email_from')
      .eq('id', SETTINGS_UUID)
      .single();
    
    if (error) {
      console.error('❌ Error fetching settings:', error);
      return;
    }
    
    console.log('✅ Settings found:');
    console.log('   Email Confirmation Enabled:', data.email_confirmation_enabled);
    console.log('   SMTP Host:', data.smtp_host);
    console.log('   From Email:', data.email_from);
    
    // Test the public API endpoint
    console.log('\n🔍 Testing public API endpoint...');
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/settings/public`);
    const publicData = await response.json();
    
    if (response.ok) {
      console.log('✅ Public API response:', publicData.settings);
    } else {
      console.error('❌ Public API error:', publicData);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSettings(); 