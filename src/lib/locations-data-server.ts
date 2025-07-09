import { createSupabaseServerClientSafe } from '@/lib/supabase/server-fallback'

export interface LocationData {
  id: string
  name: string
  description?: string
  image_url?: string
  image_storage_path?: string
  created_at: string
  updated_at: string
  property_count?: number
}

export async function getLocationsData(): Promise<LocationData[]> {
  try {
    const supabase = await createSupabaseServerClientSafe()
    

    
    const { data: locations, error } = await supabase
      .from('property_locations')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching locations:', error)
      return []
    }
    
    return locations || []
  } catch (error) {
    console.error('Error in getLocationsData:', error)
    return []
  }
}

export async function getTopLocationsWithPropertyCount(limit = 20): Promise<LocationData[]> {
  try {
    const supabase = await createSupabaseServerClientSafe()
    // Get all active locations
    const { data: locations, error } = await supabase
      .from('property_locations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching locations:', error)
      return []
    }
    // For each location, get the property count
    const locationsWithCount = await Promise.all(
      (locations || []).map(async (location: LocationData) => {
        try {
          const { count } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('location_id', location.id)
            .eq('status', 'active')
          return {
            ...location,
            property_count: count || 0
          }
        } catch (err) {
          console.warn(`Failed to fetch property count for location ${location.id}:`, err)
          return {
            ...location,
            property_count: 0
          }
        }
      })
    )
    // Sort by property_count descending and take top N
    return locationsWithCount
      .sort((a, b) => (b.property_count || 0) - (a.property_count || 0))
      .slice(0, limit)
  } catch (error) {
    console.error('Error in getTopLocationsWithPropertyCount:', error)
    return []
  }
} 