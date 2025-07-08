// Test script to check database access
const { createClient } = require('@supabase/supabase-js')

// You'll need to add your Supabase URL and anon key here
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabaseAccess() {
  console.log('Testing database access...\n')

  // Test 1: Check if blogs table exists and has data
  console.log('1. Testing blogs table access...')
  try {
    const { data: blogs, error: blogsError } = await supabase
      .from('blogs')
      .select('id, title, status, created_at')
      .limit(5)

    if (blogsError) {
      console.error('❌ Blogs table error:', blogsError)
    } else {
      console.log('✅ Blogs table accessible')
      console.log(`   Found ${blogs?.length || 0} blogs`)
      if (blogs && blogs.length > 0) {
        console.log('   Sample blogs:', blogs.map(b => ({ id: b.id, title: b.title, status: b.status })))
      }
    }
  } catch (err) {
    console.error('❌ Exception accessing blogs:', err)
  }

  // Test 2: Check published blogs specifically
  console.log('\n2. Testing published blogs...')
  try {
    const { data: publishedBlogs, error: publishedError } = await supabase
      .from('blogs')
      .select('id, title, status')
      .eq('status', 'published')
      .limit(3)

    if (publishedError) {
      console.error('❌ Published blogs error:', publishedError)
    } else {
      console.log('✅ Published blogs query successful')
      console.log(`   Found ${publishedBlogs?.length || 0} published blogs`)
    }
  } catch (err) {
    console.error('❌ Exception accessing published blogs:', err)
  }

  // Test 3: Check properties table
  console.log('\n3. Testing properties table access...')
  try {
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title, status, property_collection')
      .limit(5)

    if (propertiesError) {
      console.error('❌ Properties table error:', propertiesError)
    } else {
      console.log('✅ Properties table accessible')
      console.log(`   Found ${properties?.length || 0} properties`)
      if (properties && properties.length > 0) {
        console.log('   Sample properties:', properties.map(p => ({ id: p.id, title: p.title, status: p.status, collection: p.property_collection })))
      }
    }
  } catch (err) {
    console.error('❌ Exception accessing properties:', err)
  }

  // Test 4: Check featured properties
  console.log('\n4. Testing featured properties...')
  try {
    const { data: featuredProps, error: featuredError } = await supabase
      .from('properties')
      .select('id, title, property_collection, status')
      .eq('property_collection', 'Featured')
      .eq('status', 'active')
      .limit(3)

    if (featuredError) {
      console.error('❌ Featured properties error:', featuredError)
    } else {
      console.log('✅ Featured properties query successful')
      console.log(`   Found ${featuredProps?.length || 0} featured properties`)
    }
  } catch (err) {
    console.error('❌ Exception accessing featured properties:', err)
  }

  // Test 5: Check RLS policies
  console.log('\n5. Testing RLS policies...')
  try {
    // Test as anonymous user
    const { data: anonBlogs, error: anonError } = await supabase
      .from('blogs')
      .select('id, title')
      .eq('status', 'published')
      .limit(1)

    if (anonError) {
      console.error('❌ Anonymous access error:', anonError)
    } else {
      console.log('✅ Anonymous access working')
    }
  } catch (err) {
    console.error('❌ Exception testing RLS:', err)
  }

  console.log('\n=== Test Complete ===')
}

testDatabaseAccess().catch(console.error) 