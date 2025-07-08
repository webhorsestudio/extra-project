import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupBrandingBucket() {
  try {
    console.log('Setting up branding storage bucket...')

    // Create the branding bucket
    const { error: bucketError } = await supabase.storage.createBucket('branding', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/*']
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('Branding bucket already exists')
      } else {
        console.error('Error creating branding bucket:', bucketError)
        return
      }
    } else {
      console.log('Branding bucket created successfully')
    }

    // Set up storage policies
    const policies = [
      {
        name: 'Allow authenticated users to upload branding assets',
        policy: `
          CREATE POLICY "Allow authenticated users to upload branding assets" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'branding' AND 
            auth.role() = 'authenticated'
          );
        `
      },
      {
        name: 'Allow public to view branding assets',
        policy: `
          CREATE POLICY "Allow public to view branding assets" ON storage.objects
          FOR SELECT USING (bucket_id = 'branding');
        `
      },
      {
        name: 'Allow authenticated users to delete branding assets',
        policy: `
          CREATE POLICY "Allow authenticated users to delete branding assets" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'branding' AND 
            auth.role() = 'authenticated'
          );
        `
      },
      {
        name: 'Allow authenticated users to update branding assets',
        policy: `
          CREATE POLICY "Allow authenticated users to update branding assets" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'branding' AND 
            auth.role() = 'authenticated'
          );
        `
      }
    ]

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.policy })
        if (error) {
          if (error.message.includes('already exists')) {
            console.log(`Policy "${policy.name}" already exists`)
          } else {
            console.error(`Error creating policy "${policy.name}":`, error)
          }
        } else {
          console.log(`Policy "${policy.name}" created successfully`)
        }
      } catch (error) {
        console.error(`Error creating policy "${policy.name}":`, error)
      }
    }

    console.log('Branding bucket setup completed!')
    console.log('\nNext steps:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to Storage > Buckets')
    console.log('3. Verify the "branding" bucket exists')
    console.log('4. Check that the policies are applied correctly')

  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupBrandingBucket() 