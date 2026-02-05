const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Test script to debug profile fetching in AdminLayout
async function testAdminProfileFetch() {
  console.log('🔍 Testing Admin Profile Fetch...')
  
  // Check environment variables
  console.log('\n📋 Environment Variables:')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables')
    return
  }

  // Create admin client
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Create regular client
  const regularClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    console.log('\n🔐 Testing Authentication...')
    
    // Test getting current user
    const { data: { user }, error: authError } = await regularClient.auth.getUser()
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      return
    }

    if (!user) {
      console.log('⚠️  No authenticated user found')
      console.log('💡 Please sign in first to test profile fetching')
      return
    }

    console.log('✅ User authenticated:', user.email)
    console.log('🆔 User ID:', user.id)

    console.log('\n📊 Testing Profile Fetch with Admin Client...')
    
    // Test admin client profile fetch
    const { data: adminProfile, error: adminError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (adminError) {
      console.error('❌ Admin client error:', adminError)
    } else {
      console.log('✅ Admin client profile:', adminProfile)
    }

    console.log('\n📊 Testing Profile Fetch with Regular Client...')
    
    // Test regular client profile fetch
    const { data: regularProfile, error: regularError } = await regularClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (regularError) {
      console.error('❌ Regular client error:', regularError)
    } else {
      console.log('✅ Regular client profile:', regularProfile)
    }

    console.log('\n🔍 Testing RLS Policies...')
    
    // Test if RLS is enabled
    const { data: rlsInfo, error: rlsError } = await adminClient
      .rpc('get_rls_policies', { table_name: 'profiles' })
      .catch(() => ({ data: null, error: 'RPC function not available' }))

    if (rlsError) {
      console.log('ℹ️  RLS info not available:', rlsError)
    } else {
      console.log('ℹ️  RLS policies:', rlsInfo)
    }

    console.log('\n📋 Profile Summary:')
    if (adminProfile) {
      console.log('✅ Admin Client - Profile found')
      console.log('   Name:', adminProfile.full_name)
      console.log('   Role:', adminProfile.role)
      console.log('   Created:', adminProfile.created_at)
    } else {
      console.log('❌ Admin Client - No profile found')
    }

    if (regularProfile) {
      console.log('✅ Regular Client - Profile found')
      console.log('   Name:', regularProfile.full_name)
      console.log('   Role:', regularProfile.role)
      console.log('   Created:', regularProfile.created_at)
    } else {
      console.log('❌ Regular Client - No profile found')
    }

    // Test admin role check
    if (adminProfile && adminProfile.role === 'admin') {
      console.log('\n🎉 SUCCESS: User has admin role!')
    } else if (adminProfile) {
      console.log('\n⚠️  User profile found but not admin role:', adminProfile.role)
    } else {
      console.log('\n❌ No profile found - cannot determine admin status')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testAdminProfileFetch()
  .then(() => {
    console.log('\n🏁 Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  }) 