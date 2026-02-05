import { createSupabaseServerClientSafe } from '@/lib/supabase/server-fallback'

export async function getPropertiesData(filters?: {
  location?: string;
  min_price?: number;
  max_price?: number;
  type?: string;
  bhk?: number;
  category?: string;
}) {
  const supabase = await createSupabaseServerClientSafe()
  
  // Build the query - use a simpler approach for category relations
  let query = supabase
    .from('properties')
    .select(`
      id,
      slug,
      title,
      description,
      location,
      latitude,
      longitude,
      created_at,
      updated_at,
      status,
      property_collection,
      property_configurations (
        id,
        bhk,
        price,
        area,
        bedrooms,
        bathrooms,
        ready_by
      ),
      property_images (
        id,
        image_url
      ),
      property_locations (
        id,
        name,
        description
      )
    `)
    .eq('status', 'active')

  // Apply basic filters first
  if (filters?.location) {
    query = query.eq('location_id', filters.location)
  }

  if (filters?.type && filters.type !== 'Any') {
    query = query.eq('property_type', filters.type)
  }

  if (filters?.bhk && filters.bhk !== 0) {
    query = query.eq('property_configurations.bhk', filters.bhk)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }

  // Transform data to match the same structure as featured/latest properties
  const transformedProperties = (data || []).map((property: Record<string, unknown>) => {
    const propertyConfigurations = property.property_configurations;
    const price = Array.isArray(propertyConfigurations) && propertyConfigurations.length > 0 && typeof propertyConfigurations[0] === 'object'
      ? (propertyConfigurations[0] as { price?: number }).price ?? null
      : null;
    const propertyLocations = property.property_locations;
    const location_data = Array.isArray(propertyLocations) && propertyLocations.length > 0 && typeof propertyLocations[0] === 'object'
      ? propertyLocations[0]
      : propertyLocations;
    return {
      ...property,
      price,
      location_data,
      categories: [] // Initialize empty categories array
    };
  });

  // Apply client-side filters
  let filteredProperties = transformedProperties

  // Apply category filter in application layer
  if (filters?.category) {
    // Fetch category data for all properties if category filter is applied
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('property_category_relations')
        .select(`
          property_id,
          property_categories (
            id,
            name,
            icon
          )
        `)
      
      if (!categoryError && categoryData) {
        // Create a map of property_id to categories
        const propertyCategoriesMap = new Map();
        categoryData.forEach((relation: Record<string, unknown>) => {
          const propertyId = relation.property_id;
          const category = relation.property_categories;
          
          if (!propertyCategoriesMap.has(propertyId)) {
            propertyCategoriesMap.set(propertyId, []);
          }
          
          if (category && typeof category === 'object') {
            const cat = category as { name?: string; icon?: string };
            propertyCategoriesMap.get(propertyId).push({
              name: cat.name,
              icon: cat.icon
            });
          }
        });
        
        // Update properties with their categories
        filteredProperties = filteredProperties.map(property => ({
          ...property,
          categories: propertyCategoriesMap.get((property as { id?: string }).id as string) || []
        }));
        
        // Filter by category
        filteredProperties = filteredProperties.filter(property => {
          return property.categories?.some((cat: Record<string, unknown>) => cat.name === filters.category);
        });
      }
    } catch (error) {
      console.error('Error in category filtering:', error);
    }
  }

  // Apply client-side filters for price range
  if (filters?.min_price || filters?.max_price) {
    filteredProperties = filteredProperties.filter(property => {
      if (!property.price) return false
      
      const minPrice = filters.min_price ? filters.min_price * 100000 : 0
      const maxPrice = filters.max_price ? filters.max_price * 100000 : Infinity
      
      return property.price >= minPrice && property.price <= maxPrice
    })
  }

  return filteredProperties
} 