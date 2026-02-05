const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const sampleCategories = [
  {
    name: 'Apartment',
    icon: 'Home',
    is_active: true
  },
  {
    name: 'House',
    icon: 'Building',
    is_active: true
  },
  {
    name: 'Villa',
    icon: 'Building2',
    is_active: true
  },
  {
    name: 'Office',
    icon: 'Briefcase',
    is_active: true
  },
  {
    name: 'Shop',
    icon: 'Store',
    is_active: true
  },
  {
    name: 'Land',
    icon: 'MapPin',
    is_active: true
  },
  {
    name: 'Warehouse',
    icon: 'Package',
    is_active: true
  },
  {
    name: 'Farm',
    icon: 'Trees',
    is_active: true
  }
]

async function addSampleCategories() {
  try {
    console.log('Adding sample property categories...')
    
    // First, check if categories already exist
    const { data: existingCategories, error: checkError } = await supabase
      .from('property_categories')
      .select('name')

    if (checkError) {
      console.error('Error checking existing categories:', checkError)
      return
    }

    if (existingCategories && existingCategories.length > 0) {
      console.log('Categories already exist. Skipping...')
      existingCategories.forEach(cat => {
        console.log(`- ${cat.name}`)
      })
      return
    }

    const { data, error } = await supabase
      .from('property_categories')
      .insert(sampleCategories)
      .select()

    if (error) {
      console.error('Error adding categories:', error)
      return
    }

    console.log('Successfully added categories:', data.length)
    data.forEach(category => {
      console.log(`- ${category.name} (Icon: ${category.icon}, ID: ${category.id})`)
    })

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the script
addSampleCategories() 