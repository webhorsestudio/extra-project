const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Check environment variables
console.log('🔍 Testing Property Edit Data Fetching...')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables!')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testPropertyEditData() {
  console.log('\n🔍 Starting Property Edit Data Test...')
  
  try {
    // 1. Get a test property
    console.log('\n📋 Step 1: Getting a test property...')
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title')
      .limit(1)
    
    if (propertiesError) {
      console.error('❌ Properties error:', propertiesError)
      return
    }
    
    if (!properties || properties.length === 0) {
      console.log('⚠️ No properties found. Please create a property first.')
      return
    }
    
    const testPropertyId = properties[0].id
    console.log(`✅ Using property: ${properties[0].title} (ID: ${testPropertyId})`)
    
    // 2. Test the exact query from useProperty hook
    console.log('\n📋 Step 2: Testing useProperty hook query...')
    
    // Fetch basic property data
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
      return
    }
    
    console.log('✅ Property data fetched successfully')
    console.log('Property title:', propertyData?.title)
    
    // Fetch amenities relationships
    const { data: amenitiesData, error: amenitiesError } = await supabase
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
    
    if (amenitiesError) {
      console.error('❌ Amenities error:', amenitiesError)
    } else {
      console.log(`✅ Amenities data: ${amenitiesData?.length || 0} relations`)
      console.log('Amenities raw data:', amenitiesData)
    }
    
    // Fetch categories relationships
    const { data: categoriesData, error: categoriesError } = await supabase
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
    
    if (categoriesError) {
      console.error('❌ Categories error:', categoriesError)
    } else {
      console.log(`✅ Categories data: ${categoriesData?.length || 0} relations`)
      console.log('Categories raw data:', categoriesData)
    }
    
    // 3. Test data transformation (simulating useProperty hook)
    console.log('\n📋 Step 3: Testing data transformation...')
    
    const transformedFeatures = amenitiesData?.map((rel) => {
      if (rel && rel.property_amenities && Array.isArray(rel.property_amenities)) {
        const amenity = rel.property_amenities[0]
        return amenity?.name || null
      }
      return null
    }).filter((name) => Boolean(name)) || []
    
    const transformedCategories = categoriesData?.map((rel) => {
      if (rel && rel.property_categories && Array.isArray(rel.property_categories)) {
        const category = rel.property_categories[0]
        return category?.name || null
      }
      return null
    }).filter((name) => Boolean(name)) || []
    
    console.log('✅ Transformed features:', transformedFeatures)
    console.log('✅ Transformed categories:', transformedCategories)
    
    // 4. Test form data structure (simulating PropertyForm)
    console.log('\n📋 Step 4: Testing form data structure...')
    
    const formData = {
      title: propertyData?.title || '',
      description: propertyData?.description || '',
      property_type: propertyData?.property_type || 'House',
      property_nature: propertyData?.property_nature || 'Sell',
      property_collection: propertyData?.property_collection || 'Featured',
      location_id: propertyData?.location_id || '',
      location: propertyData?.location || '',
      amenities: transformedFeatures, // This should be an array of strings
      categories: transformedCategories, // This should be an array of strings
      has_rera: !!propertyData?.rera_number,
      rera_number: propertyData?.rera_number || '',
      latitude: propertyData?.latitude || 0,
      longitude: propertyData?.longitude || 0,
      posted_by: propertyData?.posted_by || '',
      developer_id: propertyData?.developer_id || '',
    }
    
    console.log('✅ Form data structure:')
    console.log('- amenities type:', Array.isArray(formData.amenities) ? 'Array' : typeof formData.amenities)
    console.log('- amenities length:', formData.amenities.length)
    console.log('- amenities content:', formData.amenities)
    console.log('- categories type:', Array.isArray(formData.categories) ? 'Array' : typeof formData.categories)
    console.log('- categories length:', formData.categories.length)
    console.log('- categories content:', formData.categories)
    
    // 5. Test API endpoints
    console.log('\n📋 Step 5: Testing API endpoints...')
    
    // Test amenities API
    try {
      const amenitiesResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/amenities`)
      const amenitiesApiData = await amenitiesResponse.json()
      
      if (amenitiesResponse.ok) {
        console.log(`✅ Amenities API: ${amenitiesApiData.amenities?.length || 0} amenities available`)
        console.log('Sample amenities:', amenitiesApiData.amenities?.slice(0, 3).map(a => a.name))
      } else {
        console.error('❌ Amenities API error:', amenitiesApiData.error)
      }
    } catch (error) {
      console.error('❌ Amenities API request failed:', error.message)
    }
    
    // Test categories API
    try {
      const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/categories`)
      const categoriesApiData = await categoriesResponse.json()
      
      if (categoriesResponse.ok) {
        console.log(`✅ Categories API: ${categoriesApiData.categories?.length || 0} categories available`)
        console.log('Sample categories:', categoriesApiData.categories?.slice(0, 3).map(c => c.name))
      } else {
        console.error('❌ Categories API error:', categoriesApiData.error)
      }
    } catch (error) {
      console.error('❌ Categories API request failed:', error.message)
    }
    
    console.log('\n🎉 Property Edit Data Test completed!')
    console.log('\n📝 Summary:')
    console.log(`- Property: ${propertyData?.title}`)
    console.log(`- Amenities found: ${transformedFeatures.length}`)
    console.log(`- Categories found: ${transformedCategories.length}`)
    console.log(`- Data structure: ✅ Correct (arrays of strings)`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testPropertyEditData() 