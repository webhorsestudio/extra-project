// Test script to check enquiry submission
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Check environment variables
console.log('Checking environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Supabase environment variables not configured');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testEnquirySubmission() {
  try {
    console.log('\n🔍 Testing database connection...');
    
    // Test 1: Check if inquiries table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('inquiries')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Table check failed:', tableError);
      return;
    }

    console.log('✅ Inquiries table exists');

    // Test 2: Try to insert a test enquiry
    const testEnquiry = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      message: 'This is a test enquiry',
      inquiry_type: 'property',
      status: 'unread',
    };

    console.log('\n📝 Testing enquiry insertion...');
    const { data, error: insertError } = await supabase
      .from('inquiries')
      .insert([testEnquiry])
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return;
    }

    console.log('✅ Enquiry inserted successfully:', data);

    // Test 3: Clean up test data
    if (data && data[0]) {
      console.log('\n🧹 Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', data[0].id);

      if (deleteError) {
        console.error('⚠️ Cleanup failed:', deleteError);
      } else {
        console.log('✅ Test data cleaned up');
      }
    }

    console.log('\n🎉 All tests passed! Enquiry submission should work.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEnquirySubmission(); 