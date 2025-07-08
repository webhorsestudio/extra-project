// Test script to verify exec_sql RPC function
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing exec_sql RPC function...');

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

async function testRPCFunction() {
  try {
    console.log('\n🔧 Testing if exec_sql RPC function exists...');
    
    // Test a simple query first
    const { data: testData, error: testError } = await supabase
      .rpc('exec_sql', {
        sql: 'SELECT 1 as test_value'
      });

    if (testError) {
      console.error('❌ exec_sql RPC function not available:', testError);
      console.log('\n💡 Alternative: Using direct table queries...');
      
      // Fallback to direct table queries
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

      if (usersError) {
        console.error('❌ Direct query also failed:', usersError);
      } else {
        console.log('✅ Direct query works:', users?.length || 0, 'users found');
      }
      
      return;
    }

    console.log('✅ exec_sql RPC function works!');
    console.log('Test result:', testData);

    console.log('\n📊 Testing profiles query via RPC...');
    const { data: users, error: usersError } = await supabase
      .rpc('exec_sql', {
        sql: 'SELECT COUNT(*) as user_count FROM profiles'
      });

    if (usersError) {
      console.error('❌ Profiles query failed:', usersError);
    } else {
      console.log('✅ Profiles query works:', users);
    }

    console.log('\n🎉 RPC function test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRPCFunction(); 