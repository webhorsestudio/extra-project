import { createSupabaseServerClientSafe } from '@/lib/supabase/server-fallback'

export interface ConfigurationData {
  propertyTypes: string[]
  bhkOptions: number[]
}

export async function getConfigurationData(): Promise<ConfigurationData> {
  try {
    const supabase = await createSupabaseServerClientSafe()
    
    // Add caching for better performance
    const cacheOptions = {
      next: { revalidate: 3600 } // Cache for 1 hour
    }
    
    // Fetch unique property types from properties table
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('property_type')
      .eq('status', 'active')
      .not('property_type', 'is', null)
    
    if (propertiesError) {
      console.error('Error fetching property types:', propertiesError)
    }
    
    // Fetch unique BHK values from property_configurations table
    const { data: configurations, error: configurationsError } = await supabase
      .from('property_configurations')
      .select('bhk')
      .not('bhk', 'is', null)
    
    if (configurationsError) {
      console.error('Error fetching BHK configurations:', configurationsError)
    }
    
    // Extract unique property types
    const propertyTypes = properties 
      ? [...new Set(properties.map(p => p.property_type).filter(Boolean))].sort()
      : []
    
    // Extract unique BHK values
    const bhkOptions = configurations 
      ? [...new Set(configurations.map(c => c.bhk).filter(Boolean))].sort((a, b) => a - b)
      : []
    
    return {
      propertyTypes: ['Any', ...propertyTypes],
      bhkOptions: [0, ...bhkOptions] // 0 represents "Any"
    }
  } catch (error) {
    console.error('Error in getConfigurationData:', error)
    return {
      propertyTypes: ['Any', 'Apartment', 'House', 'Villa', 'Commercial'],
      bhkOptions: [0, 1, 2, 3, 4, 5]
    }
  }
} 