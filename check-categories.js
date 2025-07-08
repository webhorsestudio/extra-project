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

async function checkCategories() {
  try {
    console.log('Checking property categories...')
    
    const { data, error } = await supabase
      .from('property_categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching categories:', error)
      return
    }

    console.log('Categories found:', data.length)
    data.forEach(category => {
      console.log(`- ${category.name} (Icon: ${category.icon}, Active: ${category.is_active})`)
    })

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkCategories() 