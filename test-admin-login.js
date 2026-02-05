const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔐 Admin Login Test');
console.log('==================');

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Supabase environment variables not configured');
  process.exit(1);
}

// Create Supabase client with anon key (for auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAdminLogin() {
  try {
    console.log('\n📧 Testing admin login...');
    
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123456';

    console.log(`🔑 Attempting login with: ${adminEmail}`);

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      return;
    }

    console.log('✅ Login successful!');
    console.log('📋 User details:');
    console.log(`   ID: ${data.user.id}`);
    console.log(`   Email: ${data.user.email}`);
    console.log(`   Created: ${data.user.created_at}`);

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError.message);
    } else {
      console.log('📋 Profile details:');
      console.log(`   Name: ${profile.full_name}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Is Admin: ${profile.role === 'admin' ? 'Yes' : 'No'}`);
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('👋 Signed out successfully');

    console.log('\n🎉 Admin login test completed successfully!');
    console.log('💡 You can now use these credentials in the admin panel.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminLogin(); 