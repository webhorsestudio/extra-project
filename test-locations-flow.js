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

async function testLocationsFlow() {
  try {
    console.log('=== Testing Locations Data Flow ===\n')
    
    // 1. Test database query
    console.log('1. Testing database query...')
    const { data: dbLocations, error: dbError } = await supabase
      .from('property_locations')
      .select('*')
      .order('name', { ascending: true })
    
    if (dbError) {
      console.error('Database error:', dbError)
      return
    }
    
    console.log(`✅ Database: Found ${dbLocations.length} locations`)
    console.log('Sample locations:', dbLocations.slice(0, 2).map(l => l.name))
    
    // 2. Test API endpoint
    console.log('\n2. Testing API endpoint...')
    const response = await fetch('http://localhost:3000/api/locations')
    const apiData = await response.json()
    
    if (!response.ok) {
      console.error('API error:', apiData)
      return
    }
    
    console.log(`✅ API: Found ${apiData.locations.length} locations`)
    console.log('Sample locations:', apiData.locations.slice(0, 2).map(l => l.name))
    
    // 3. Compare database vs API
    console.log('\n3. Comparing database vs API...')
    if (dbLocations.length === apiData.locations.length) {
      console.log('✅ Database and API have same number of locations')
    } else {
      console.log('❌ Database and API have different number of locations')
      console.log(`Database: ${dbLocations.length}, API: ${apiData.locations.length}`)
    }
    
    // 4. Check if locations are active
    console.log('\n4. Checking active locations...')
    const activeLocations = dbLocations.filter(l => l.is_active)
    console.log(`✅ Active locations: ${activeLocations.length}/${dbLocations.length}`)
    
    if (activeLocations.length === 0) {
      console.log('⚠️  Warning: No active locations found!')
    }
    
    console.log('\n=== Test Complete ===')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testLocationsFlow() 