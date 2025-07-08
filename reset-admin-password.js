const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔐 Admin Password Reset');
console.log('=======================');

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

async function resetAdminPassword() {
  try {
    console.log('\n📊 Finding admin user...');
    
    // Get admin profile
    const { data: adminProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles query failed:', profilesError);
      return;
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log('❌ No admin users found');
      return;
    }

    const adminProfile = adminProfiles[0];
    console.log(`✅ Found admin user: ${adminProfile.full_name} (${adminProfile.id})`);

    // Get current email
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(adminProfile.id);
    
    if (authError) {
      console.error('❌ Could not get auth user:', authError);
      return;
    }

    console.log(`📧 Current email: ${authUser.user.email}`);

    // Set new password
    const newPassword = 'admin123456';
    
    console.log(`🔐 Resetting password to: ${newPassword}`);
    
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      adminProfile.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Failed to reset password:', updateError);
      return;
    }

    console.log('✅ Password reset successfully!');
    console.log('\n📋 Login Details:');
    console.log(`   Email: ${authUser.user.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   Name: ${adminProfile.full_name}`);
    
    console.log('\n💡 You can now sign in to the admin panel with these credentials.');
    console.log('⚠️  Remember to change the password after logging in!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

resetAdminPassword(); 