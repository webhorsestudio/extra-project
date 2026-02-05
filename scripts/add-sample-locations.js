const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const sampleLocations = [
  {
    name: 'Bandra West',
    description: 'Prime residential area with excellent connectivity',
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
    is_active: true
  },
  {
    name: 'Juhu',
    description: 'Beachfront luxury properties with sea views',
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    is_active: true
  },
  {
    name: 'Andheri West',
    description: 'Commercial hub with residential complexes',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    is_active: true
  },
  {
    name: 'Powai',
    description: 'Lakeside properties with modern amenities',
    image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
    is_active: true
  },
  {
    name: 'Worli',
    description: 'Premium residential area with city views',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    is_active: true
  },
  {
    name: 'Lower Parel',
    description: 'Mixed-use development with luxury apartments',
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
    is_active: true
  }
]

async function addSampleLocations() {
  try {
    console.log('Adding sample locations...')
    
    const { data, error } = await supabase
      .from('property_locations')
      .insert(sampleLocations)
      .select()

    if (error) {
      console.error('Error adding locations:', error)
      return
    }

    console.log('Successfully added locations:', data.length)
    data.forEach(location => {
      console.log(`- ${location.name} (ID: ${location.id})`)
    })

    // Add some sample properties to these locations
    await addSampleProperties(data)

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

async function addSampleProperties(locations) {
  try {
    console.log('\nAdding sample properties...')
    
    const sampleProperties = locations.map((location, index) => ({
      title: `Sample Property ${index + 1} in ${location.name}`,
      description: `Beautiful property in ${location.name} with modern amenities and excellent connectivity.`,
      property_type: ['Apartment', 'House', 'Villa'][index % 3],
      property_collection: ['Newly Launched', 'Featured', 'Ready to Move'][index % 3],
      location_id: location.id,
      location: location.name,
      latitude: 19.0760 + (Math.random() - 0.5) * 0.1,
      longitude: 72.8777 + (Math.random() - 0.5) * 0.1,
      status: 'active',
      is_verified: true,
      verified_at: new Date().toISOString(),
      parking: Math.random() > 0.5,
      parking_spots: Math.floor(Math.random() * 3) + 1,
      created_by: '00000000-0000-0000-0000-000000000000', // Placeholder
      posted_by: 'Admin'
    }))

    const { data, error } = await supabase
      .from('properties')
      .insert(sampleProperties)
      .select()

    if (error) {
      console.error('Error adding properties:', error)
      return
    }

    console.log('Successfully added properties:', data.length)
    data.forEach(property => {
      console.log(`- ${property.title} (Location: ${property.location})`)
    })

  } catch (error) {
    console.error('Error adding properties:', error)
  }
}

// Run the script
addSampleLocations() 