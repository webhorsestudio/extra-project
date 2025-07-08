import { supabase } from '@/lib/supabaseClient'

/**
 * Create property-amenity relationships
 */
export async function createPropertyAmenityRelations(propertyId: string, amenityNames: string[]) {
  if (!amenityNames || amenityNames.length === 0) {
    return { success: true, data: [] }
  }

  try {
    // Get amenity IDs from names
    const { data: amenities, error: fetchError } = await supabase
      .from('property_amenities')
      .select('id, name')
      .in('name', amenityNames)

    if (fetchError) {
      throw fetchError
    }

    const amenityIds = amenities?.map(a => a.id) || []

    // Create amenity relationships
    if (amenityIds.length > 0) {
      const amenityRelations = amenityIds.map(amenityId => ({
        property_id: propertyId,
        amenity_id: amenityId
      }))

      const { data, error: insertError } = await supabase
        .from('property_amenity_relations')
        .insert(amenityRelations)
        .select()

      if (insertError) {
        throw insertError
      }

      return { success: true, data }
    }

    return { success: true, data: [] }
  } catch (error) {
    console.error('Error creating amenity relationships:', error)
    return { success: false, error }
  }
}

/**
 * Create property-category relationships
 */
export async function createPropertyCategoryRelations(propertyId: string, categoryNames: string[]) {
  if (!categoryNames || categoryNames.length === 0) {
    return { success: true, data: [] }
  }

  try {
    // Get category IDs from names
    const { data: categories, error: fetchError } = await supabase
      .from('property_categories')
      .select('id, name')
      .in('name', categoryNames)

    if (fetchError) {
      throw fetchError
    }

    const categoryIds = categories?.map(c => c.id) || []

    // Create category relationships
    if (categoryIds.length > 0) {
      const categoryRelations = categoryIds.map(categoryId => ({
        property_id: propertyId,
        category_id: categoryId
      }))

      const { data, error: insertError } = await supabase
        .from('property_category_relations')
        .insert(categoryRelations)
        .select()

      if (insertError) {
        throw insertError
      }

      return { success: true, data }
    }

    return { success: true, data: [] }
  } catch (error) {
    console.error('Error creating category relationships:', error)
    return { success: false, error }
  }
}

/**
 * Update property-amenity relationships (delete existing and create new)
 */
export async function updatePropertyAmenityRelations(propertyId: string, amenityNames: string[]) {
  try {
    // Delete existing relationships
    const { error: deleteError } = await supabase
      .from('property_amenity_relations')
      .delete()
      .eq('property_id', propertyId)

    if (deleteError) {
      throw deleteError
    }

    // Create new relationships
    return await createPropertyAmenityRelations(propertyId, amenityNames)
  } catch (error) {
    console.error('Error updating amenity relationships:', error)
    return { success: false, error }
  }
}

/**
 * Update property-category relationships (delete existing and create new)
 */
export async function updatePropertyCategoryRelations(propertyId: string, categoryNames: string[]) {
  try {
    // Delete existing relationships
    const { error: deleteError } = await supabase
      .from('property_category_relations')
      .delete()
      .eq('property_id', propertyId)

    if (deleteError) {
      throw deleteError
    }

    // Create new relationships
    return await createPropertyCategoryRelations(propertyId, categoryNames)
  } catch (error) {
    console.error('Error updating category relationships:', error)
    return { success: false, error }
  }
} 