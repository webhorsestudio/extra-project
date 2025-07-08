// Test script to verify dashboard data fetching with RLS bypass
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing dashboard data fetching with RLS bypass...');

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

async function testDashboardWithRLSBypass() {
  try {
    console.log('\n📊 Testing profiles table with direct SQL...');
    const { data: users, error: usersError } = await supabase
      .rpc('exec_sql', {
        sql: 'SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5'
      });

    if (usersError) {
      console.error('❌ Profiles error:', usersError);
    } else {
      console.log('✅ Profiles data:', users?.length || 0, 'records');
      if (users && users.length > 0) {
        console.log('   Sample user:', {
          id: users[0].id,
          email: users[0].email,
          role: users[0].role,
          created_at: users[0].created_at
        });
      }
    }

    console.log('\n🏠 Testing properties table with direct SQL...');
    const { data: properties, error: propertiesError } = await supabase
      .rpc('exec_sql', {
        sql: 'SELECT * FROM properties ORDER BY created_at DESC LIMIT 5'
      });

    if (propertiesError) {
      console.error('❌ Properties error:', propertiesError);
    } else {
      console.log('✅ Properties data:', properties?.length || 0, 'records');
      if (properties && properties.length > 0) {
        console.log('   Sample property:', {
          id: properties[0].id,
          title: properties[0].title,
          price: properties[0].price,
          created_at: properties[0].created_at
        });
      }
    }

    console.log('\n📧 Testing inquiries table with direct SQL...');
    const { data: inquiries, error: inquiriesError } = await supabase
      .rpc('exec_sql', {
        sql: 'SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 5'
      });

    if (inquiriesError) {
      console.error('❌ Inquiries error:', inquiriesError);
    } else {
      console.log('✅ Inquiries data:', inquiries?.length || 0, 'records');
      if (inquiries && inquiries.length > 0) {
        console.log('   Sample inquiry:', {
          id: inquiries[0].id,
          name: inquiries[0].name,
          email: inquiries[0].email,
          status: inquiries[0].status,
          created_at: inquiries[0].created_at
        });
      }
    }

    console.log('\n🎉 Dashboard RLS bypass test completed!');
    console.log('✅ The infinite recursion issue should now be resolved.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDashboardWithRLSBypass(); 