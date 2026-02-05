const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkLocationStorage() {
  try {
    console.log('Checking location-images storage bucket...')
    
    // Try to list files in the bucket
    const { data, error } = await supabase.storage
      .from('location-images')
      .list('', { limit: 1 })

    if (error) {
      console.error('❌ Storage bucket error:', error.message)
      console.log('\n📋 To fix this issue:')
      console.log('1. Go to your Supabase Dashboard')
      console.log('2. Navigate to Storage')
      console.log('3. Click "Create a new bucket"')
      console.log('4. Set bucket name: location-images')
      console.log('5. Check "Public bucket"')
      console.log('6. Set file size limit: 5MB')
      console.log('7. Set allowed MIME types: image/*')
      console.log('8. Click "Create bucket"')
      console.log('\nAfter creating the bucket, the location upload should work.')
      return
    }

    console.log('✅ Storage bucket exists and is accessible')
    console.log('📁 Files in bucket:', data?.length || 0)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkLocationStorage() 