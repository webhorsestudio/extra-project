// Fix RLS infinite recursion issue
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Fixing RLS infinite recursion issue...');

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

async function fixRLSRecursion() {
  try {
    console.log('\n🗑️ Dropping problematic RLS policies...');
    
    // Drop all existing policies on profiles table
    const policiesToDrop = [
      'Allow admins to delete all data',
      'Allow admins to read all data', 
      'Allow admins to update all data',
      'Allow authenticated users to delete profiles',
      'Allow authenticated users to insert profiles',
      'Allow authenticated users to read profiles',
      'Allow users to access their own profile',
      'Allow users to update own profile',
      'Authenticated users can delete profiles',
      'Authenticated users can update all profiles',
      'Authenticated users can view all profiles',
      'Service role can insert profiles',
      'Users can insert their profile',
      'Users can update own profile',
      'Users can view own profile',
      'Users can view their profile'
    ];

    for (const policyName of policiesToDrop) {
      try {
        await supabase.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS "${policyName}" ON profiles;`
        });
        console.log(`✅ Dropped policy: ${policyName}`);
      } catch (error) {
        console.log(`⚠️ Could not drop policy ${policyName}:`, error.message);
      }
    }

    console.log('\n🔧 Dropping problematic is_admin function...');
    try {
      await supabase.rpc('exec_sql', {
        sql: 'DROP FUNCTION IF EXISTS is_admin();'
      });
      console.log('✅ Dropped is_admin function');
    } catch (error) {
      console.log('⚠️ Could not drop is_admin function:', error.message);
    }

    console.log('\n🔄 Creating new is_admin function...');
    const isAdminFunction = `
      CREATE OR REPLACE FUNCTION is_admin()
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid()::uuid 
          AND profiles.role = 'admin'
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    try {
      await supabase.rpc('exec_sql', { sql: isAdminFunction });
      console.log('✅ Created new is_admin function');
    } catch (error) {
      console.log('⚠️ Could not create is_admin function:', error.message);
    }

    console.log('\n🛡️ Creating clean RLS policies...');
    
    // Create clean policies
    const cleanPolicies = [
      `CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid()::uuid);`,
      `CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid()::uuid);`,
      `CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid()::uuid);`,
      `CREATE POLICY "Admin full access to profiles" ON profiles FOR ALL USING (is_admin());`
    ];

    for (const policy of cleanPolicies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy });
        console.log('✅ Created policy');
      } catch (error) {
        console.log('⚠️ Could not create policy:', error.message);
      }
    }

    console.log('\n✅ RLS cleanup completed!');
    console.log('🎉 The infinite recursion issue should now be fixed.');
    
  } catch (error) {
    console.error('❌ Error during RLS cleanup:', error);
  }
}

fixRLSRecursion(); 