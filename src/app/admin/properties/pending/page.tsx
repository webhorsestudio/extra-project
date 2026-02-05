import { createSupabaseAdminUserClient } from '@/lib/supabase/admin'
import PendingPropertiesClient from './PendingPropertiesClient'

export default async function PendingPropertiesPage() {
  const supabase = await createSupabaseAdminUserClient()
  
  try {
    // Fetch properties that are pending approval (status = 'pending')
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        property_type,
        property_nature,
        property_collection,
        location,
        location_id,
        latitude,
        longitude,
        created_at,
        updated_at,
        rera_number,
        is_verified,
        status,
        posted_by,
        created_by,
        developer_id,
        property_images (
          id,
          image_url
        ),
        property_configurations (
          id,
          price,
          bhk,
          area,
          bedrooms,
          bathrooms,
          ready_by,
          floor_plan_url,
          brochure_url
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
        ),
        property_locations (
          id,
          name,
          description
        ),
        property_developers (
          id,
          name,
          logo_url
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (propertiesError) {
      console.error('Error fetching pending properties:', propertiesError)
      return <PendingPropertiesClient properties={[]} />
    }

    // Get creator information separately to avoid join issues
    const creatorIds = [...new Set(propertiesData?.map(p => p.created_by).filter(Boolean) || [])]
    let creatorProfiles: Record<string, { id: string; full_name: string }> = {}
    
    if (creatorIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', creatorIds)
      
      if (profilesData) {
        creatorProfiles = profilesData.reduce((acc, profile) => {
          acc[profile.id] = profile
          return acc
        }, {} as Record<string, { id: string; full_name: string }>)
      }
    }

    const transformedProperties = propertiesData.map(property => {
      const firstConfig = property.property_configurations?.[0]
      const viewCount = property.property_views?.length || 0
      const favoriteCount = property.property_favorites?.length || 0
      const reviewCount = property.property_reviews?.length || 0
      const averageRating = property.property_reviews && property.property_reviews.length > 0
        ? property.property_reviews.reduce((sum, review) => sum + review.rating, 0) / property.property_reviews.length
        : 0

      const creatorProfile = property.created_by ? creatorProfiles[property.created_by] : null

      return {
        id: property.id,
        title: property.title,
        description: property.description,
        price: firstConfig?.price || 0,
        property_type: property.property_type,
        property_nature: property.property_nature,
        property_collection: property.property_collection || 'Featured',
        location: property.location,
        location_id: property.location_id,
        latitude: property.latitude,
        longitude: property.longitude,
        thumbnail_url: property.property_images?.[0]?.image_url || null,
        bhk: firstConfig?.bhk || 1,
        area: firstConfig?.area || 0,
        bedrooms: firstConfig?.bedrooms || 1,
        bathrooms: firstConfig?.bathrooms || 1,
        ready_by: firstConfig?.ready_by || '',
        floor_plan_url: firstConfig?.floor_plan_url || null,
        brochure_url: firstConfig?.brochure_url || null,
        created_at: property.created_at,
        updated_at: property.updated_at,
        status: property.status || 'pending',
        rera_number: property.rera_number,
        is_verified: property.is_verified || false,
        posted_by: property.posted_by,
        created_by: property.created_by,
        developer_id: property.developer_id,
        developer_name: Array.isArray(property.property_developers) && property.property_developers.length > 0 
          ? property.property_developers[0]?.name || null 
          : null,
        developer_logo: Array.isArray(property.property_developers) && property.property_developers.length > 0 
          ? property.property_developers[0]?.logo_url || null 
          : null,
        location_name: Array.isArray(property.property_locations) && property.property_locations.length > 0 
          ? property.property_locations[0]?.name || null 
          : null,
        creator_name: creatorProfile?.full_name || null,
        creator_email: null, // We'll skip email for now to avoid auth.users join issues
        view_count: viewCount,
        favorite_count: favoriteCount,
        review_count: reviewCount,
        average_rating: averageRating,
        total_configurations: property.property_configurations?.length || 0,
        total_images: property.property_images?.length || 0,
      }
    })

    return <PendingPropertiesClient properties={transformedProperties} />
  } catch (error) {
    console.error('Error in PendingPropertiesPage:', error)
    return <PendingPropertiesClient properties={[]} />
  }
} 