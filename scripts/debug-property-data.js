const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Check environment variables
console.log('🔍 Environment Variables Check:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables!')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugPropertyData() {
  console.log('\n🔍 Starting Property Data Debug...')
  
  try {
    // 1. Check if properties exist
    console.log('\n📋 Step 1: Checking properties table...')
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title')
      .limit(5)
    
    if (propertiesError) {
      console.error('❌ Properties error:', propertiesError)
      return
    }
    
    console.log(`✅ Found ${properties?.length || 0} properties`)
    if (properties && properties.length > 0) {
      console.log('Sample properties:', properties.map(p => ({ id: p.id, title: p.title })))
    }
    
    if (!properties || properties.length === 0) {
      console.log('⚠️ No properties found. Please create a property first.')
      return
    }
    
    const testPropertyId = properties[0].id
    console.log(`\n🎯 Using property ID for testing: ${testPropertyId}`)
    
    // 2. Check amenities table
    console.log('\n📋 Step 2: Checking amenities table...')
    const { data: amenities, error: amenitiesError } = await supabase
      .from('property_amenities')
      .select('*')
      .eq('is_active', true)
      .limit(5)
    
    if (amenitiesError) {
      console.error('❌ Amenities error:', amenitiesError)
    } else {
      console.log(`✅ Found ${amenities?.length || 0} active amenities`)
      if (amenities && amenities.length > 0) {
        console.log('Sample amenities:', amenities.map(a => ({ id: a.id, name: a.name, is_active: a.is_active })))
      }
    }
    
    // 3. Check categories table
    console.log('\n📋 Step 3: Checking categories table...')
    const { data: categories, error: categoriesError } = await supabase
      .from('property_categories')
      .select('*')
      .eq('is_active', true)
      .limit(5)
    
    if (categoriesError) {
      console.error('❌ Categories error:', categoriesError)
    } else {
      console.log(`✅ Found ${categories?.length || 0} active categories`)
      if (categories && categories.length > 0) {
        console.log('Sample categories:', categories.map(c => ({ id: c.id, name: c.name, is_active: c.is_active })))
      }
    }
    
    // 4. Check property amenity relations
    console.log('\n📋 Step 4: Checking property amenity relations...')
    const { data: amenityRelations, error: amenityRelationsError } = await supabase
      .from('property_amenity_relations')
      .select(`
        amenity_id,
        property_amenities(
          id,
          name,
          image_url,
          image_storage_path,
          is_active
        )
      `)
      .eq('property_id', testPropertyId)
    
    if (amenityRelationsError) {
      console.error('❌ Property amenity relations error:', amenityRelationsError)
    } else {
      console.log(`✅ Found ${amenityRelations?.length || 0} amenity relations for property`)
      if (amenityRelations && amenityRelations.length > 0) {
        console.log('Amenity relations:', amenityRelations.map(rel => ({
          amenity_id: rel.amenity_id,
          amenity_name: rel.property_amenities?.name,
          amenity_active: rel.property_amenities?.is_active
        })))
      }
    }
    
    // 5. Check property category relations
    console.log('\n📋 Step 5: Checking property category relations...')
    const { data: categoryRelations, error: categoryRelationsError } = await supabase
      .from('property_category_relations')
      .select(`
        category_id,
        property_categories(
          id,
          name,
          icon,
          is_active
        )
      `)
      .eq('property_id', testPropertyId)
    
    if (categoryRelationsError) {
      console.error('❌ Property category relations error:', categoryRelationsError)
    } else {
      console.log(`✅ Found ${categoryRelations?.length || 0} category relations for property`)
      if (categoryRelations && categoryRelations.length > 0) {
        console.log('Category relations:', categoryRelations.map(rel => ({
          category_id: rel.category_id,
          category_name: rel.property_categories?.name,
          category_active: rel.property_categories?.is_active
        })))
      }
    }
    
    // 6. Test the exact query from useProperty hook
    console.log('\n📋 Step 6: Testing useProperty hook query...')
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .select(`
        *,
        developer:property_developers(*)
      `)
      .eq('id', testPropertyId)
      .single()
    
    if (propertyError) {
      console.error('❌ Property query error:', propertyError)
    } else {
      console.log('✅ Property data fetched successfully')
      console.log('Property title:', propertyData?.title)
      console.log('Property developer:', propertyData?.developer)
    }
    
    // 7. Test RLS policies
    console.log('\n📋 Step 7: Testing RLS policies...')
    
    // Test amenities API endpoint
    console.log('\n🔗 Testing /api/amenities endpoint...')
    try {
      const amenitiesResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/amenities`)
      const amenitiesData = await amenitiesResponse.json()
      
      if (amenitiesResponse.ok) {
        console.log(`✅ Amenities API: Found ${amenitiesData.amenities?.length || 0} amenities`)
      } else {
        console.error('❌ Amenities API error:', amenitiesData.error)
      }
    } catch (error) {
      console.error('❌ Amenities API request failed:', error.message)
    }
    
    // Test categories API endpoint
    console.log('\n🔗 Testing /api/categories endpoint...')
    try {
      const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/categories`)
      const categoriesData = await categoriesResponse.json()
      
      if (categoriesResponse.ok) {
        console.log(`✅ Categories API: Found ${categoriesData.categories?.length || 0} categories`)
      } else {
        console.error('❌ Categories API error:', categoriesData.error)
      }
    } catch (error) {
      console.error('❌ Categories API request failed:', error.message)
    }
    
    console.log('\n🎉 Debug completed!')
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

debugPropertyData() 