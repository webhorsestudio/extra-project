// Script to fix RLS policies for inquiries table
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations
);

async function fixInquiriesRLS() {
  try {
    console.log('🔧 Fixing RLS policies for inquiries table...');

    // Drop existing policies
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Allow authenticated users to read inquiries" ON inquiries;',
      'DROP POLICY IF EXISTS "Allow authenticated users to update inquiries" ON inquiries;',
      'DROP POLICY IF EXISTS "Allow public to insert inquiries" ON inquiries;',
      'DROP POLICY IF EXISTS "Allow public to read inquiries" ON inquiries;'
    ];

    for (const policy of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.log('Note: Policy might not exist:', error.message);
      }
    }

    // Create new policies
    const createPolicies = [
      `CREATE POLICY "Allow authenticated users to read inquiries" ON inquiries
       FOR SELECT USING (auth.role() = 'authenticated');`,
      
      `CREATE POLICY "Allow authenticated users to update inquiries" ON inquiries
       FOR UPDATE USING (auth.role() = 'authenticated');`,
      
      `CREATE POLICY "Allow public to insert inquiries" ON inquiries
       FOR INSERT WITH CHECK (true);`,
      
      `CREATE POLICY "Allow public to read inquiries" ON inquiries
       FOR SELECT USING (true);`
    ];

    for (const policy of createPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.error('Error creating policy:', error.message);
      } else {
        console.log('✅ Policy created successfully');
      }
    }

    console.log('🎉 RLS policies fixed!');

    // Test the fix
    console.log('\n🧪 Testing the fix...');
    const testClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const testEnquiry = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      message: 'This is a test enquiry after RLS fix',
      inquiry_type: 'property',
      status: 'unread',
    };

    const { data, error } = await testClient
      .from('inquiries')
      .insert([testEnquiry])
      .select();

    if (error) {
      console.error('❌ Still failing:', error);
    } else {
      console.log('✅ Test successful! Enquiry inserted:', data);
      
      // Clean up
      await testClient
        .from('inquiries')
        .delete()
        .eq('id', data[0].id);
      console.log('🧹 Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Error fixing RLS:', error);
  }
}

fixInquiriesRLS(); 