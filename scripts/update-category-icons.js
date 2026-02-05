const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Icon name mappings
const iconMappings = {
  'Map': 'MapPin'
}

async function updateCategoryIcons() {
  try {
    console.log('Updating category icons...')
    
    // Get all categories
    const { data: categories, error: fetchError } = await supabase
      .from('property_categories')
      .select('id, name, icon')

    if (fetchError) {
      console.error('Error fetching categories:', fetchError)
      return
    }

    console.log('Found categories:', categories.length)
    
    // Update categories with incorrect icon names
    for (const category of categories) {
      const newIcon = iconMappings[category.icon]
      if (newIcon && category.icon !== newIcon) {
        console.log(`Updating ${category.name}: ${category.icon} -> ${newIcon}`)
        
        const { error: updateError } = await supabase
          .from('property_categories')
          .update({ icon: newIcon })
          .eq('id', category.id)

        if (updateError) {
          console.error(`Error updating ${category.name}:`, updateError)
        } else {
          console.log(`Successfully updated ${category.name}`)
        }
      }
    }

    console.log('Icon update completed')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the script
updateCategoryIcons() 