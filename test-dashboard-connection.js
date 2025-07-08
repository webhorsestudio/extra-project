// Test script to verify dashboard data fetching
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing dashboard data fetching...');

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase environment variables not configured');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDashboardData() {
  try {
    console.log('\n📊 Testing profiles table...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Profiles error:', usersError);
    } else {
      console.log('✅ Profiles data:', users?.length || 0, 'records');
    }

    console.log('\n🏠 Testing properties table...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .limit(5);

    if (propertiesError) {
      console.error('❌ Properties error:', propertiesError);
    } else {
      console.log('✅ Properties data:', properties?.length || 0, 'records');
    }

    console.log('\n📧 Testing inquiries table...');
    const { data: inquiries, error: inquiriesError } = await supabase
      .from('inquiries')
      .select('*')
      .limit(5);

    if (inquiriesError) {
      console.error('❌ Inquiries error:', inquiriesError);
    } else {
      console.log('✅ Inquiries data:', inquiries?.length || 0, 'records');
    }

    console.log('\n🎉 Dashboard data test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDashboardData(); 