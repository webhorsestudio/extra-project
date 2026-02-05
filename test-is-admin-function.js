const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testIsAdminFunction() {
  console.log('🔍 Testing is_admin() function...')

  try {
    // Test 1: Check if function exists
    console.log('\n1. Checking if is_admin() function exists...')
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname, proargtypes, prorettype')
      .eq('proname', 'is_admin')

    if (funcError) {
      console.log('⚠️ Could not check function existence:', funcError.message)
    } else if (functions.length === 0) {
      console.log('❌ is_admin() function not found!')
      return
    } else {
      console.log('✅ is_admin() function exists:', functions[0])
    }

    // Test 2: Try to call the function (this will fail if not authenticated)
    console.log('\n2. Testing is_admin() function call...')
    const { data: adminCheck, error: adminError } = await supabase
      .rpc('is_admin')

    if (adminError) {
      console.log('⚠️ Function call failed (expected if not authenticated):', adminError.message)
    } else {
      console.log('✅ Function call successful:', adminCheck)
    }

    // Test 3: Check current policies
    console.log('\n3. Checking current RLS policies...')
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname, cmd, qual')
      .eq('tablename', 'profiles')

    if (policiesError) {
      console.log('⚠️ Could not check policies:', policiesError.message)
    } else {
      console.log('📋 Current profiles policies:')
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd}`)
        if (policy.qual) {
          console.log(`     Condition: ${policy.qual}`)
        }
      })
    }

    // Test 4: Check if we can authenticate and test the function
    console.log('\n4. Testing with admin authentication...')
    
    // Try to sign in with admin credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123' // You may need to adjust this password
    })

    if (authError) {
      console.log('⚠️ Could not authenticate:', authError.message)
      console.log('💡 Try signing in manually and then test the profile page')
    } else {
      console.log('✅ Authenticated as admin:', authData.user.email)
      
      // Now test the function again
      const { data: adminCheck2, error: adminError2 } = await supabase
        .rpc('is_admin')

      if (adminError2) {
        console.log('❌ Function still failing:', adminError2.message)
      } else {
        console.log('✅ is_admin() returns:', adminCheck2)
      }

      // Test profile access
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.log('❌ Profile access failed:', profileError.message)
      } else {
        console.log('✅ Profile access successful:', {
          id: profile.id,
          full_name: profile.full_name,
          role: profile.role
        })
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testIsAdminFunction() 