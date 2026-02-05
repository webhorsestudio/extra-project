const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateAdminPassword() {
  try {
    console.log('🔍 Searching for admin users...');
    
    // First, find admin users
    const { data: adminUsers, error: findError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        role,
        created_at,
        auth_users!inner(
          id,
          email,
          created_at
        )
      `)
      .eq('role', 'admin');

    if (findError) {
      console.error('❌ Error finding admin users:', findError);
      return;
    }

    if (!adminUsers || adminUsers.length === 0) {
      console.log('⚠️  No admin users found. Creating a new admin user...');
      
      // Create a new admin user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'admin@example.com',
        password: 'Krishna@2025',
        email_confirm: true,
        user_metadata: {
          full_name: 'Admin User'
        }
      });

      if (createError) {
        console.error('❌ Error creating admin user:', createError);
        return;
      }

      // Update the profile to have admin role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin', full_name: 'Admin User' })
        .eq('id', newUser.user.id);

      if (profileError) {
        console.error('❌ Error updating profile:', profileError);
        return;
      }

      console.log('✅ Created new admin user:', newUser.user.email);
      return;
    }

    console.log(`📋 Found ${adminUsers.length} admin user(s):`);
    adminUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.auth_users.email} (${user.full_name})`);
    });

    // Update password for the first admin user
    const firstAdmin = adminUsers[0];
    console.log(`\n🔐 Updating password for: ${firstAdmin.auth_users.email}`);

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      firstAdmin.id,
      { password: 'Krishna@2025' }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      return;
    }

    console.log('✅ Successfully updated admin password to: Krishna@2025');
    console.log(`📧 Admin email: ${firstAdmin.auth_users.email}`);
    console.log(`👤 Admin name: ${firstAdmin.full_name}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the function
updateAdminPassword()
  .then(() => {
    console.log('\n🎉 Password update process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }); 