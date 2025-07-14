const { createClient } = require('@supabase/supabase-js')

// Test script to verify theme settings functionality
async function testThemeSettings() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    console.log('Testing theme settings...')

    // Test 1: Check if settings table has the new columns
    console.log('\n1. Checking database schema...')
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching settings:', error)
      return
    }

    console.log('✅ Settings table exists and has data')
    console.log('Current settings:', {
      primary_color: settings.primary_color,
      secondary_color: settings.secondary_color,
      accent_color: settings.accent_color,
      font_family: settings.font_family,
      font_size_base: settings.font_size_base,
      border_radius: settings.border_radius,
    })

    // Test 2: Update theme settings
    console.log('\n2. Testing theme settings update...')
    const testUpdate = {
      primary_color: '#ff0000',
      secondary_color: '#f0f0f0',
      accent_color: '#00ff00',
      font_family: 'Roboto',
      font_size_base: '18px',
      border_radius: '12px',
      enable_dark_mode: true,
      enable_animations: false,
      enable_shadows: true,
    }

    const { data: updatedSettings, error: updateError } = await supabase
      .from('settings')
      .update(testUpdate)
      .eq('id', settings.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating settings:', updateError)
      return
    }

    console.log('✅ Theme settings updated successfully')
    console.log('Updated settings:', {
      primary_color: updatedSettings.primary_color,
      secondary_color: updatedSettings.secondary_color,
      accent_color: updatedSettings.accent_color,
      font_family: updatedSettings.font_family,
      font_size_base: updatedSettings.font_size_base,
      border_radius: updatedSettings.border_radius,
      enable_dark_mode: updatedSettings.enable_dark_mode,
      enable_animations: updatedSettings.enable_animations,
      enable_shadows: updatedSettings.enable_shadows,
    })

    // Test 3: Reset to default values
    console.log('\n3. Resetting to default values...')
    const defaultUpdate = {
      primary_color: '#0ea5e9',
      secondary_color: '#f8fafc',
      accent_color: '#06b6d4',
      font_family: 'Inter',
      font_size_base: '16px',
      border_radius: '8px',
      enable_dark_mode: false,
      enable_animations: true,
      enable_shadows: true,
    }

    const { data: resetSettings, error: resetError } = await supabase
      .from('settings')
      .update(defaultUpdate)
      .eq('id', settings.id)
      .select()
      .single()

    if (resetError) {
      console.error('Error resetting settings:', resetError)
      return
    }

    console.log('✅ Settings reset to defaults successfully')
    console.log('All tests passed! 🎉')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testThemeSettings()
}

module.exports = { testThemeSettings } 