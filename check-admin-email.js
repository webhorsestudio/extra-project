const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Admin User Email Check');
console.log('=========================');

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase environment variables not configured');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminEmail() {
  try {
    console.log('\n📊 Finding admin users...');
    
    // Get admin profiles
    const { data: adminProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');
    
    if (profilesError) {
      console.error('❌ Profiles query failed:', profilesError);
      return;
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log('❌ No admin users found');
      return;
    }

    console.log(`✅ Found ${adminProfiles.length} admin user(s):`);
    
    // Get email for each admin user
    for (const profile of adminProfiles) {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id);
      
      if (authError) {
        console.log(`   ❌ Could not get email for user ${profile.id}: ${authError.message}`);
      } else {
        console.log(`   📧 Email: ${authUser.user.email}`);
        console.log(`   👤 Name: ${profile.full_name}`);
        console.log(`   🆔 ID: ${profile.id}`);
        console.log(`   📅 Created: ${profile.created_at}`);
        console.log('');
      }
    }
    
    console.log('💡 Use one of these email addresses to sign in to the admin panel.');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

checkAdminEmail(); 