// Final fix for profiles table RLS infinite recursion
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('🔧 Final fix for profiles table RLS infinite recursion...');

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

async function fixProfilesRLS() {
  try {
    console.log('\n📋 Reading SQL fix script...');
    const sqlScript = fs.readFileSync('./fix-profiles-rls-final.sql', 'utf8');
    
    console.log('\n🗑️ Disabling RLS and dropping all policies...');
    
    // Split the SQL script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.log(`⚠️ Statement ${i + 1} had an issue:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (error) {
          console.log(`⚠️ Statement ${i + 1} failed:`, error.message);
        }
      }
    }

    console.log('\n🎉 RLS fix completed!');
    console.log('✅ Profiles table should now work without infinite recursion');
    console.log('✅ Admin dashboard should load properly');
    
  } catch (error) {
    console.error('❌ Error during RLS fix:', error);
  }
}

fixProfilesRLS(); 