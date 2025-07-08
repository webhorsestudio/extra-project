const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSearchFunctionality() {
  try {
    console.log('Testing search functionality...\n')

    // 1. Test locations API
    console.log('1. Testing locations API...')
    const { data: locations, error: locationsError } = await supabase
      .from('property_locations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (locationsError) {
      console.error('Error fetching locations:', locationsError)
    } else {
      console.log(`Found ${locations.length} active locations:`)
      locations.forEach(location => {
        console.log(`  - ${location.name} (ID: ${location.id})`)
      })
    }

    // 2. Test property counts for each location
    console.log('\n2. Testing property counts...')
    for (const location of locations || []) {
      const { count, error: countError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', location.id)
        .eq('status', 'active')

      if (countError) {
        console.error(`Error getting count for ${location.name}:`, countError)
      } else {
        console.log(`  - ${location.name}: ${count || 0} properties`)
      }
    }

    // 3. Test properties table
    console.log('\n3. Testing properties table...')
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .limit(5)

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
    } else {
      console.log(`Found ${properties.length} active properties:`)
      properties.forEach(property => {
        console.log(`  - ${property.title} (Location: ${property.location})`)
      })
    }

    // 4. Test search functionality
    console.log('\n4. Testing search functionality...')
    const searchTerm = 'Bandra'
    const { data: searchResults, error: searchError } = await supabase
      .from('property_locations')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .eq('is_active', true)

    if (searchError) {
      console.error('Error searching locations:', searchError)
    } else {
      console.log(`Search for "${searchTerm}" found ${searchResults.length} results:`)
      searchResults.forEach(result => {
        console.log(`  - ${result.name}`)
      })
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the test
testSearchFunctionality() 