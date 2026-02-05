import { createSupabaseAdminUserClient } from '@/lib/supabase/admin'
import { checkAdminAuth } from '@/lib/admin-data'
import { redirect } from 'next/navigation'
import PropertyReviewClient from './PropertyReviewClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PropertyViewPage({ params }: PageProps) {
  await checkAdminAuth()
  const { id } = await params
  
  const supabase = await createSupabaseAdminUserClient()
  
  try {
    // Fetch property with all related data for review
    const { data: property, error: propertyError } = await supabase
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
      .eq('id', id)
      .single()

    if (propertyError) {
      console.error('Error fetching property for review:', propertyError)
      redirect('/admin/properties/pending')
    }

    if (!property) {
      redirect('/admin/properties/pending')
    }

    // Get creator information
    let creatorProfile = null
    if (property.created_by) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', property.created_by)
        .single()
      
      creatorProfile = profileData
    }

    // Get default values from first configuration if available
    const firstConfig = Array.isArray(property.property_configurations) && property.property_configurations.length > 0 
      ? property.property_configurations[0] 
      : null

    // Transform property data
    const transformedProperty = {
      ...property,
      bhk: firstConfig?.bhk || 0,
      area: firstConfig?.area || 0,
      bedrooms: firstConfig?.bedrooms || 0,
      bathrooms: firstConfig?.bathrooms || 0,
      ready_by: firstConfig?.ready_by || '',
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
      view_count: property.property_views?.length || 0,
      favorite_count: property.property_favorites?.length || 0,
      review_count: property.property_reviews?.length || 0,
      average_rating: property.property_reviews && property.property_reviews.length > 0
        ? property.property_reviews.reduce((sum, review) => sum + review.rating, 0) / property.property_reviews.length
        : 0,
      total_configurations: property.property_configurations?.length || 0,
      total_images: property.property_images?.length || 0,
    }

    return <PropertyReviewClient property={transformedProperty} />
  } catch (error) {
    console.error('Error in PropertyViewPage:', error)
    redirect('/admin/properties/pending')
  }
}
