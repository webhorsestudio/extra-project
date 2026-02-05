import { createSupabaseAdminUserClient } from '@/lib/supabase/admin'
import PropertiesClient from './PropertiesClient'

export default async function PropertiesPage() {
  const supabase = await createSupabaseAdminUserClient()
  
  try {
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        property_type,
        property_collection,
        location,
        created_at,
        rera_number,
        is_verified,
        property_images (
          image_url
        ),
        property_configurations (
          price,
          bhk,
          area,
          bedrooms,
          bathrooms
        ),
        property_views (
          id
        ),
        property_favorites (
          id
        ),
        property_reviews (
          id,
          rating
        )
      `)
      .order('created_at', { ascending: false })

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
      return <PropertiesClient properties={[]} />
    }

    const transformedProperties = propertiesData.map(property => {
      const firstConfig = property.property_configurations?.[0]
      const viewCount = property.property_views?.length || 0
      const favoriteCount = property.property_favorites?.length || 0
      const reviewCount = property.property_reviews?.length || 0

      return {
        id: property.id,
        title: property.title,
        price: firstConfig?.price || 0,
        property_type: property.property_type,
        property_collection: property.property_collection || 'Featured',
        location: property.location,
        thumbnail_url: property.property_images?.[0]?.image_url || null,
        bhk: firstConfig?.bhk || 1,
        area: firstConfig?.area || 0,
        bedrooms: firstConfig?.bedrooms || 1,
        bathrooms: firstConfig?.bathrooms || 1,
        created_at: property.created_at,
        status: 'Active',
        rera_number: property.rera_number,
        is_verified: property.is_verified || false,
        view_count: viewCount,
        favorite_count: favoriteCount,
        review_count: reviewCount,
      }
    })

    return <PropertiesClient properties={transformedProperties} />
  } catch (error) {
    console.error('Error in PropertiesPage:', error)
    return <PropertiesClient properties={[]} />
  }
} 
