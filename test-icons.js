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

// Common Lucide icon names
const validIcons = [
  'Home', 'Heart', 'Star', 'Map', 'Building', 'Castle', 'Briefcase', 'Store', 
  'Package', 'TreePine', 'Tag', 'Search', 'Filter', 'Settings', 'User', 'Mail',
  'Phone', 'MapPin', 'Calendar', 'Clock', 'DollarSign', 'TrendingUp', 'TrendingDown'
]

async function testIcons() {
  try {
    console.log('Testing icon names...')
    
    const { data, error } = await supabase
      .from('property_categories')
      .select('name, icon')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching categories:', error)
      return
    }

    console.log('Categories and their icons:')
    data.forEach(category => {
      const isValid = validIcons.includes(category.icon)
      console.log(`- ${category.name}: ${category.icon} ${isValid ? '✅' : '❌'}`)
    })

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testIcons() 