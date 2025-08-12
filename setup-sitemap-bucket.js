const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupSitemapBucket() {
  try {
    console.log('🚀 Setting up sitemap storage bucket...')

    // Create the sitemap bucket
    const { error: bucketError } = await supabase.storage.createBucket('sitemap', {
      public: true,
      fileSizeLimit: 1048576, // 1MB
      allowedMimeTypes: ['text/xml', 'application/xml']
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Sitemap bucket already exists')
      } else {
        console.error('❌ Error creating sitemap bucket:', bucketError)
        return
      }
    } else {
      console.log('✅ Sitemap bucket created successfully')
    }

    console.log('\n📋 Next steps:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to Storage > Policies')
    console.log('3. Run the SQL from the migration file: supabase/migrations/20250217000078_create_sitemap_storage_bucket.sql')
    console.log('4. Or manually create these policies:')
    console.log('   - Public Access to sitemap (SELECT)')
    console.log('   - Authenticated users can upload sitemap (INSERT)')
    console.log('   - Authenticated users can update sitemap (UPDATE)')
    console.log('   - Authenticated users can delete sitemap (DELETE)')
    
    console.log('\n🎯 After setting up the policies, try generating a sitemap again!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

setupSitemapBucket()
