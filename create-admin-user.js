const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔧 Admin User Creation Script');
console.log('=============================');

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase environment variables not configured');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.log('Please check your .env.local file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminUser() {
  try {
    console.log('\n📊 Checking existing users...');
    
    // Check existing profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('❌ Profiles query failed:', profilesError);
      return;
    }

    console.log(`✅ Found ${profiles?.length || 0} existing profiles`);
    
    // Check for existing admin users
    const adminUsers = profiles?.filter(p => p.role === 'admin') || [];
    console.log(`📋 Found ${adminUsers.length} admin users:`);
    
    adminUsers.forEach((admin, index) => {
      console.log(`   ${index + 1}. ID: ${admin.id}, Name: ${admin.full_name}, Role: ${admin.role}`);
    });

    if (adminUsers.length > 0) {
      console.log('\n✅ Admin users already exist! You can use any of these accounts.');
      console.log('💡 If you need to sign in, use the email associated with one of these admin users.');
      return;
    }

    console.log('\n🔧 No admin users found. Creating a new admin user...');
    
    // Create a new admin user
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123456'; // You should change this!
    const adminName = 'Admin User';

    console.log(`📧 Creating admin user: ${adminEmail}`);
    
    // Create the user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminName
      }
    });

    if (authError) {
      console.error('❌ Failed to create auth user:', authError);
      return;
    }

    console.log('✅ Auth user created successfully');

    // Update the profile to have admin role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        full_name: adminName,
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)
      .select();

    if (profileError) {
      console.error('❌ Failed to update profile:', profileError);
      return;
    }

    console.log('✅ Profile updated with admin role');

    console.log('\n🎉 Admin user created successfully!');
    console.log('📋 Login Details:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   Role: admin`);
    
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('🔐 You can change the password in the admin dashboard or Supabase dashboard.');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

createAdminUser(); 