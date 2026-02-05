// Test the data transformation logic
const testAmenitiesData = [
  {
    amenity_id: '126325ca-3002-41ee-bcb5-2afaac2c75d3',
    property_amenities: {
      id: '126325ca-3002-41ee-bcb5-2afaac2c75d3',
      name: 'Gym',
      image_url: 'test.jpg',
      is_active: true,
      image_storage_path: 'amenity-1751584186542.webp'
    }
  },
  {
    amenity_id: '618ac6d2-3ab1-4cdc-9ae2-9f8c30ebc97a',
    property_amenities: {
      id: '618ac6d2-3ab1-4cdc-9ae2-9f8c30ebc97a',
      name: 'Temple',
      image_url: 'test.jpg',
      is_active: true,
      image_storage_path: 'amenity-1750809798022.jpg'
    }
  }
]

const testCategoriesData = [
  {
    category_id: '504f90bc-a500-4f3e-ade1-e6456b7de20a',
    property_categories: {
      id: '504f90bc-a500-4f3e-ade1-e6456b7de20a',
      icon: 'Sun',
      name: 'Endless Sea View',
      is_active: true
    }
  },
  {
    category_id: '199c6c28-507f-42a7-a060-50fc4ef389ea',
    property_categories: {
      id: '199c6c28-507f-42a7-a060-50fc4ef389ea',
      icon: 'Heart',
      name: 'Trending',
      is_active: true
    }
  }
]

console.log('🔍 Testing Data Transformation Logic...')

// Test amenities transformation
const transformedFeatures = testAmenitiesData?.map((rel) => {
  console.log('🔍 Processing amenity relation:', rel)
  if (rel && rel.property_amenities) {
    // Handle both array and single object cases
    const amenity = Array.isArray(rel.property_amenities) 
      ? rel.property_amenities[0] 
      : rel.property_amenities
    console.log('🔍 Extracted amenity:', amenity)
    return amenity?.name || null
  }
  return null
}).filter((name) => Boolean(name)) || []

// Test categories transformation
const transformedCategories = testCategoriesData?.map((rel) => {
  console.log('🔍 Processing category relation:', rel)
  if (rel && rel.property_categories) {
    // Handle both array and single object cases
    const category = Array.isArray(rel.property_categories) 
      ? rel.property_categories[0] 
      : rel.property_categories
    console.log('🔍 Extracted category:', category)
    return category?.name || null
  }
  return null
}).filter((name) => Boolean(name)) || []

console.log('\n✅ Transformed features:', transformedFeatures)
console.log('✅ Transformed categories:', transformedCategories)

console.log('\n🎉 Transformation test completed!') 