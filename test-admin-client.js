// Test script to check admin client configuration
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Check environment variables
console.log('Checking environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Required environment variables not configured');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAdminClient() {
  try {
    console.log('\n🔍 Testing admin client with service role key...');
    
    // Test 1: Check if we can access properties table
    console.log('\n📊 Testing properties table access...');
    const { data: properties, count: propertiesCount, error: propertiesError } = await supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .limit(1);

    if (propertiesError) {
      console.error('❌ Properties table error:', propertiesError);
    } else {
      console.log('✅ Properties table accessible, count:', propertiesCount);
    }

    // Test 2: Check if we can access inquiries table
    console.log('\n📝 Testing inquiries table access...');
    const { data: inquiries, count: inquiriesCount, error: inquiriesError } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact' })
      .limit(1);

    if (inquiriesError) {
      console.error('❌ Inquiries table error:', inquiriesError);
    } else {
      console.log('✅ Inquiries table accessible, count:', inquiriesCount);
    }

    // Test 3: Check if we can access profiles table
    console.log('\n👥 Testing profiles table access...');
    const { data: profiles, count: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .limit(1);

    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError);
    } else {
      console.log('✅ Profiles table accessible, count:', profilesCount);
    }

    // Test 4: Check if we can access blogs table
    console.log('\n📰 Testing blogs table access...');
    const { data: blogs, count: blogsCount, error: blogsError } = await supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .limit(1);

    if (blogsError) {
      console.error('❌ Blogs table error:', blogsError);
    } else {
      console.log('✅ Blogs table accessible, count:', blogsCount);
    }

    // Test 5: Check if we can access pages table
    console.log('\n📄 Testing pages table access...');
    const { data: pages, count: pagesCount, error: pagesError } = await supabase
      .from('pages')
      .select('*', { count: 'exact' })
      .limit(1);

    if (pagesError) {
      console.error('❌ Pages table error:', pagesError);
    } else {
      console.log('✅ Pages table accessible, count:', pagesCount);
    }

    console.log('\n🎉 Admin client test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminClient(); 