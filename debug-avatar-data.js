require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAvatarData() {
  console.log('🔍 Checking avatar data in profiles table...\n');

  try {
    // Get all profiles with avatar data
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, avatar_data, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return;
    }

    console.log(`📊 Found ${profiles.length} profiles:\n`);

    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name || 'No name'} (${profile.email})`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Avatar URL: ${profile.avatar_url ? '✅ Set' : '❌ Not set'}`);
      console.log(`   Avatar Data: ${profile.avatar_data ? '✅ Set (base64)' : '❌ Not set'}`);
      
      if (profile.avatar_data) {
        console.log(`   Avatar Data Length: ${profile.avatar_data.length} characters`);
        console.log(`   Avatar Data Preview: ${profile.avatar_data.substring(0, 50)}...`);
      }
      console.log('');
    });

    // Check for admin users specifically
    const adminProfiles = profiles.filter(p => p.role === 'admin');
    console.log(`👑 Admin users (${adminProfiles.length}):`);
    adminProfiles.forEach(profile => {
      console.log(`   - ${profile.full_name || profile.email}`);
      console.log(`     Avatar URL: ${profile.avatar_url ? '✅' : '❌'}`);
      console.log(`     Avatar Data: ${profile.avatar_data ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugAvatarData(); 