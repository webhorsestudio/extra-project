const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testSettingsUpdate() {
  console.log('Testing settings update...')
  
  try {
    // First, let's check the current settings
    console.log('1. Checking current settings...')
    const { data: currentSettings, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .single()
    
    if (fetchError) {
      console.error('Error fetching settings:', fetchError)
      return
    }
    
    console.log('Current settings:', currentSettings)
    
    // Test update with minimal data
    console.log('2. Testing settings update...')
    const testUpdate = {
      site_title: 'Test Update - ' + new Date().toISOString(),
      meta_description: 'Test description'
    }
    
    const { data: updatedSettings, error: updateError } = await supabase
      .from('settings')
      .update(testUpdate)
      .eq('id', 1)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating settings:', updateError)
      console.error('Error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      })
      return
    }
    
    console.log('Settings updated successfully:', updatedSettings)
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the test
testSettingsUpdate() 