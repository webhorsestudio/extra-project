const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Check environment variables
console.log('🔍 Adding Test Property Data (Admin)...')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables!')
  process.exit(1)
}

// Create Supabase admin client (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addTestPropertyDataAdmin() {
  console.log('\n🔍 Starting Test Data Addition (Admin)...')
  
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
    
    // 2. Get some amenities
    console.log('\n📋 Step 2: Getting amenities...')
    const { data: amenities, error: amenitiesError } = await supabase
      .from('property_amenities')
      .select('id, name')
      .eq('is_active', true)
      .limit(5)
    
    if (amenitiesError) {
      console.error('❌ Amenities error:', amenitiesError)
      return
    }
    
    console.log(`✅ Found ${amenities?.length || 0} amenities`)
    if (amenities && amenities.length > 0) {
      console.log('Amenities to add:', amenities.map(a => a.name))
    }
    
    // 3. Get some categories
    console.log('\n📋 Step 3: Getting categories...')
    const { data: categories, error: categoriesError } = await supabase
      .from('property_categories')
      .select('id, name')
      .eq('is_active', true)
      .limit(3)
    
    if (categoriesError) {
      console.error('❌ Categories error:', categoriesError)
      return
    }
    
    console.log(`✅ Found ${categories?.length || 0} categories`)
    if (categories && categories.length > 0) {
      console.log('Categories to add:', categories.map(c => c.name))
    }
    
    // 4. Check existing relationships
    console.log('\n📋 Step 4: Checking existing relationships...')
    
    const { data: existingAmenityRelations, error: existingAmenityError } = await supabase
      .from('property_amenity_relations')
      .select('amenity_id')
      .eq('property_id', testPropertyId)
    
    if (existingAmenityError) {
      console.error('❌ Existing amenity relations error:', existingAmenityError)
    } else {
      console.log(`✅ Existing amenity relations: ${existingAmenityRelations?.length || 0}`)
    }
    
    const { data: existingCategoryRelations, error: existingCategoryError } = await supabase
      .from('property_category_relations')
      .select('category_id')
      .eq('property_id', testPropertyId)
    
    if (existingCategoryError) {
      console.error('❌ Existing category relations error:', existingCategoryError)
    } else {
      console.log(`✅ Existing category relations: ${existingCategoryRelations?.length || 0}`)
    }
    
    // 5. Add amenity relationships
    if (amenities && amenities.length > 0) {
      console.log('\n📋 Step 5: Adding amenity relationships...')
      
      const amenityRelations = amenities.map(amenity => ({
        property_id: testPropertyId,
        amenity_id: amenity.id
      }))
      
      const { data: amenityResult, error: amenityInsertError } = await supabase
        .from('property_amenity_relations')
        .insert(amenityRelations)
        .select()
      
      if (amenityInsertError) {
        console.error('❌ Amenity relations insert error:', amenityInsertError)
      } else {
        console.log(`✅ Added ${amenityResult?.length || 0} amenity relationships`)
      }
    }
    
    // 6. Add category relationships
    if (categories && categories.length > 0) {
      console.log('\n📋 Step 6: Adding category relationships...')
      
      const categoryRelations = categories.map(category => ({
        property_id: testPropertyId,
        category_id: category.id
      }))
      
      const { data: categoryResult, error: categoryInsertError } = await supabase
        .from('property_category_relations')
        .insert(categoryRelations)
        .select()
      
      if (categoryInsertError) {
        console.error('❌ Category relations insert error:', categoryInsertError)
      } else {
        console.log(`✅ Added ${categoryResult?.length || 0} category relationships`)
      }
    }
    
    // 7. Verify the data was added
    console.log('\n📋 Step 7: Verifying added data...')
    
    const { data: finalAmenityRelations, error: finalAmenityError } = await supabase
      .from('property_amenity_relations')
      .select(`
        amenity_id,
        property_amenities(
          id,
          name,
          is_active
        )
      `)
      .eq('property_id', testPropertyId)
    
    if (finalAmenityError) {
      console.error('❌ Final amenity relations error:', finalAmenityError)
    } else {
      console.log(`✅ Final amenity relations: ${finalAmenityRelations?.length || 0}`)
      if (finalAmenityRelations && finalAmenityRelations.length > 0) {
        console.log('Amenities:', finalAmenityRelations.map(rel => rel.property_amenities?.name).filter(Boolean))
      }
    }
    
    const { data: finalCategoryRelations, error: finalCategoryError } = await supabase
      .from('property_category_relations')
      .select(`
        category_id,
        property_categories(
          id,
          name,
          is_active
        )
      `)
      .eq('property_id', testPropertyId)
    
    if (finalCategoryError) {
      console.error('❌ Final category relations error:', finalCategoryError)
    } else {
      console.log(`✅ Final category relations: ${finalCategoryRelations?.length || 0}`)
      if (finalCategoryRelations && finalCategoryRelations.length > 0) {
        console.log('Categories:', finalCategoryRelations.map(rel => rel.property_categories?.name).filter(Boolean))
      }
    }
    
    console.log('\n🎉 Test Data Addition completed!')
    console.log('\n📝 Summary:')
    console.log(`- Property: ${properties[0].title}`)
    console.log(`- Amenities added: ${finalAmenityRelations?.length || 0}`)
    console.log(`- Categories added: ${finalCategoryRelations?.length || 0}`)
    console.log('\n💡 Now you can test the Edit Property page with this data!')
    
  } catch (error) {
    console.error('❌ Test data addition failed:', error)
  }
}

addTestPropertyDataAdmin() 