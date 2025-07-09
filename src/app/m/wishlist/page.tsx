import { createSupabaseServerClientSafe } from '@/lib/supabase/server-fallback';
import MobileWishlistContent from '@/components/mobile/MobileWishlistContent';
import type { Property } from '@/types/property';

async function getWishlistProperties() {
  const supabase = await createSupabaseServerClientSafe();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // Return null to indicate user is not signed in

  // Fetch all property_favorites for this user, join with properties and property_images
  const { data, error } = await supabase
    .from('property_favorites')
    .select(`
      id,
      property:properties (
        *,
        property_images (image_url),
        property_configurations (bhk, price, area, bedrooms, bathrooms, ready_by),
        property_locations:property_locations (id, name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return [];
  
  // Allowed values for property_type and property_collection
  const allowedTypes = ['Apartment', 'House', 'Commercial', 'Land', 'Villa', 'Penthouse'];
  const allowedCollections = ['Newly Launched', 'Featured', 'Ready to Move', 'Under Construction'];

  // Transform data to match canonical Property type
  const properties = (data || [])
    .map((fav) => {
      // Check if fav.property exists and is an object
      if (!fav.property || typeof fav.property !== 'object' || Array.isArray(fav.property)) {
        return null;
      }

      const property = fav.property as Record<string, unknown>;

      const property_type =
        typeof property.property_type === 'string' && allowedTypes.includes(property.property_type)
          ? property.property_type
          : 'Apartment';

      const property_collection =
        typeof property.property_collection === 'string' && allowedCollections.includes(property.property_collection)
          ? property.property_collection
          : 'Featured';

      const property_configurations =
        Array.isArray(property.property_configurations) ? property.property_configurations : [];

      const property_images =
        Array.isArray(property.property_images) ? property.property_images : [];

      return {
        id: property.id as string,
        title: property.title as string,
        description: property.description as string,
        property_type,
        property_collection,
        location: property.location as string,
        latitude: (typeof property.latitude === 'number' ? property.latitude : 0),
        longitude: (typeof property.longitude === 'number' ? property.longitude : 0),
        created_at: property.created_at as string,
        updated_at: (property.updated_at as string) || (property.created_at as string),
        created_by: (property.created_by as string) || '',
        posted_by: (property.posted_by as string) || '',
        developer_id: (property.developer_id as string) || null,
        parking: (typeof property.parking === 'boolean' ? property.parking : false),
        parking_spots: (typeof property.parking_spots === 'number' ? property.parking_spots : null),
        rera_number: (typeof property.rera_number === 'string' ? property.rera_number : null),
        status: (typeof property.status === 'string' ? property.status : 'active'),
        is_verified: (typeof property.is_verified === 'boolean' ? property.is_verified : false),
        location_data: Array.isArray(property.property_locations)
          ? property.property_locations[0]
          : property.property_locations,
        property_images,
        property_configurations,
        // Initialize empty arrays for relationships
        amenities: [],
        categories: [],
        property_amenities: [],
        property_categories: [],
        property_views: [],
        property_favorites: [],
        view_count: 0,
        favorite_count: 0,
      } as Property;
    })
    .filter((property): property is Property => property !== null);
    
  return properties;
}

export default async function MobileWishlistPage() {
  const properties = await getWishlistProperties();
  return <MobileWishlistContent properties={properties} />;
} 