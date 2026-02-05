import { getFeaturedProperties } from '@/lib/data'
import PropertyCarousel from './PropertyCarousel'
import type { Property, BHKConfiguration, PropertyImage } from '@/types/property'

// Type for Supabase result (fields selected in the query)
type SupabaseBHKConfig = Omit<BHKConfiguration, 'property_id' | 'floor_plan_url' | 'brochure_url'>;
type SupabasePropertyImage = Pick<PropertyImage, 'id' | 'image_url' | 'display_order'>;

export default async function FeaturedProperties() {
  const properties = await getFeaturedProperties()

  if (!properties || properties.length === 0) {
    return null
  }

  // Transform the data to match Property interface
  const transformedProperties: Property[] = properties.map(property => ({
    id: property.id,
    slug: property.slug || property.id, // Include slug field
    title: property.title,
    description: property.description,
    property_type: 'Apartment' as const, // Default type since not in query
    property_nature: 'Sell' as const, // Default nature since not in query
    property_collection: property.property_collection || 'Featured' as const,
    location: property.location,
    latitude: 0, // Default value since not in query
    longitude: 0, // Default value since not in query
    created_at: property.created_at,
    updated_at: property.updated_at,
    created_by: '', // Default value since not in query
    posted_by: '', // Default value since not in query
    parking: false, // Default value since not in query
    status: property.status,
    price: property.price,
    location_data: Array.isArray(property.property_locations) && property.property_locations.length > 0
      ? { id: String(property.property_locations[0].id), name: String(property.property_locations[0].name) }
      : null,
    property_configurations: property.property_configurations?.map((config: SupabaseBHKConfig) => ({ ...config, property_id: property.id })) || [],
    property_images: property.property_images?.map((img: SupabasePropertyImage) => ({
      ...img,
      property_id: property.id,
      display_order: img.display_order || 0,
      created_at: property.created_at || ''
    })) || [],
    // Add other required fields with defaults
    amenities: [],
    categories: []
  }))

  return (
    <PropertyCarousel properties={transformedProperties} title="Featured Properties" titleAlign="left" />
  )
} 