const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAvatarUpload() {
  console.log('🔍 Testing Avatar Upload...')

  try {
    // Test 1: Check if we're authenticated
    console.log('\n1. Checking authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('❌ Not authenticated. Please sign in first.')
      console.log('💡 Try signing in with admin@example.com')
      return
    }

    console.log('✅ Authenticated as:', user.email)
    console.log('   User ID:', user.id)

    // Test 2: Check if avatars bucket exists
    console.log('\n2. Checking avatars bucket...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.log('❌ Error listing buckets:', bucketsError.message)
      return
    }

    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars')
    if (!avatarsBucket) {
      console.log('❌ Avatars bucket not found!')
      console.log('📋 Available buckets:', buckets.map(b => b.name))
      console.log('💡 You need to create the avatars bucket in Supabase Dashboard')
      return
    }

    console.log('✅ Avatars bucket found')
    console.log('   - Public:', avatarsBucket.public)
    console.log('   - File size limit:', avatarsBucket.file_size_limit)

    // Test 3: Try to list files in avatars bucket
    console.log('\n3. Testing list permissions...')
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list()

    if (listError) {
      console.log('❌ List error:', listError.message)
    } else {
      console.log('✅ List successful')
      console.log('   - Files found:', files.length)
    }

    // Test 4: Try to upload a test file
    console.log('\n4. Testing upload...')
    const testUserId = user.id
    const testFileName = `${testUserId}/test-avatar-${Date.now()}.txt`
    const testContent = 'This is a test avatar file'
    const testFile = new Blob([testContent], { type: 'text/plain' })

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testFileName, testFile, {
        upsert: false
      })

    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message)
      
      if (uploadError.message.includes('permission') || uploadError.message.includes('policy')) {
        console.log('💡 This indicates missing upload policies')
        console.log('💡 Check the storage policies in Supabase Dashboard')
      }
    } else {
      console.log('✅ Upload successful')
      console.log('   - File path:', uploadData.path)
      
      // Test 5: Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path)
      
      console.log('   - Public URL:', publicUrlData.publicUrl)
      
      // Test 6: Clean up test file
      console.log('\n5. Cleaning up test file...')
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([testFileName])
      
      if (deleteError) {
        console.log('⚠️ Cleanup failed:', deleteError.message)
      } else {
        console.log('✅ Test file cleaned up')
      }
    }

    // Test 7: Check user's existing avatars
    console.log('\n6. Checking existing avatars...')
    const { data: userFiles, error: userListError } = await supabase.storage
      .from('avatars')
      .list(testUserId)

    if (userListError) {
      console.log('❌ User files list error:', userListError.message)
    } else {
      console.log('✅ User files list successful')
      console.log('   - User avatars found:', userFiles.length)
      userFiles.forEach(file => {
        console.log(`     - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`)
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testAvatarUpload() 