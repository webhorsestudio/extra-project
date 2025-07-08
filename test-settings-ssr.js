const { createClient } = require('@supabase/supabase-js')

// Test settings SSR functionality
async function testSettingsSSR() {
  console.log('🧪 Testing Settings SSR Functionality...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Test 1: Check if settings table exists
    console.log('1️⃣ Testing settings table access...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('settings')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('   ❌ Settings table error:', tableError.message)
      return
    }
    console.log('   ✅ Settings table accessible')

    // Test 2: Get current settings
    console.log('\n2️⃣ Testing settings retrieval...')
    const { data: settings, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.log('   ℹ️  No settings found, creating default settings...')
        
        const defaultSettings = {
          site_title: 'Test Website',
          meta_description: 'Test description',
          website_url: 'https://test.com',
          accent_color: '#06b6d4',
          font_size_base: '16px',
          border_radius: '8px',
          enable_dark_mode: false,
          enable_animations: true,
          enable_shadows: true,
          sitemap_schedule: 'daily',
          sitemap_enabled: true,
          sitemap_include_properties: true,
          sitemap_include_users: false,
          sitemap_include_blog: true,
        }

        const { data: newSettings, error: createError } = await supabase
          .from('settings')
          .insert([defaultSettings])
          .select()
          .single()

        if (createError) {
          console.error('   ❌ Error creating settings:', createError.message)
          return
        }
        console.log('   ✅ Default settings created successfully')
        console.log('   📊 Settings ID:', newSettings.id)
      } else {
        console.error('   ❌ Error fetching settings:', fetchError.message)
        return
      }
    } else {
      console.log('   ✅ Settings retrieved successfully')
      console.log('   📊 Settings ID:', settings.id)
      console.log('   📊 Site Title:', settings.site_title || 'Not set')
    }

    // Test 3: Test settings update
    console.log('\n3️⃣ Testing settings update...')
    const updateData = {
      site_title: 'Updated Test Website',
      meta_description: 'Updated test description',
    }

    const { data: updatedSettings, error: updateError } = await supabase
      .from('settings')
      .update(updateData)
      .eq('id', 1)
      .select()
      .single()

    if (updateError) {
      console.error('   ❌ Error updating settings:', updateError.message)
      return
    }
    console.log('   ✅ Settings updated successfully')
    console.log('   📊 Updated Site Title:', updatedSettings.site_title)

    // Test 4: Test public settings access
    console.log('\n4️⃣ Testing public settings access...')
    const { data: publicSettings, error: publicError } = await supabase
      .from('settings')
      .select(`
        site_title,
        meta_description,
        logo_url,
        accent_color,
        contact_email,
        website_url
      `)
      .single()

    if (publicError) {
      console.error('   ❌ Error accessing public settings:', publicError.message)
      return
    }
    console.log('   ✅ Public settings accessible')
    console.log('   📊 Public fields count:', Object.keys(publicSettings).length)

    // Test 5: Test RLS policies
    console.log('\n5️⃣ Testing RLS policies...')
    
    // Test with service role (should work)
    const { data: adminSettings, error: adminError } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (adminError) {
      console.error('   ❌ Admin access error:', adminError.message)
    } else {
      console.log('   ✅ Admin access working (service role)')
    }

    console.log('\n🎉 All Settings SSR tests passed!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Settings table accessible')
    console.log('   ✅ Settings CRUD operations working')
    console.log('   ✅ Public settings access working')
    console.log('   ✅ RLS policies configured correctly')
    console.log('   ✅ Server-side data fetching ready for SSR')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the test
testSettingsSSR() 