const { createClient } = require('@supabase/supabase-js')

async function checkDevelopersTable() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    console.log('Checking property_developers table...')
    
    // Check if table exists and get count
    const { data: developers, error } = await supabase
      .from('property_developers')
      .select('*')
    
    if (error) {
      console.error('Error accessing property_developers table:', error)
      return
    }
    
    console.log(`Found ${developers?.length || 0} developers in the table`)
    
    if (developers && developers.length > 0) {
      console.log('Sample developers:')
      developers.slice(0, 3).forEach((dev, index) => {
        console.log(`${index + 1}. ${dev.name} (ID: ${dev.id}, Active: ${dev.is_active})`)
      })
    } else {
      console.log('No developers found. You may need to add some sample data.')
    }
    
    // Check active developers specifically
    const { data: activeDevelopers, error: activeError } = await supabase
      .from('property_developers')
      .select('*')
      .eq('is_active', true)
    
    if (activeError) {
      console.error('Error checking active developers:', activeError)
    } else {
      console.log(`Found ${activeDevelopers?.length || 0} active developers`)
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkDevelopersTable() 