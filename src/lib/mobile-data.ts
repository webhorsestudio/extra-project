// Mobile data fetching library
// Provides server-side and client-side functions for mobile layout

// Types for mobile data - can be imported safely in client components
export interface MobileBrandingData {
  logo_url: string | null
  company_name: string
  company_tagline: string
  site_title: string
}

export interface MobileLocationData {
  id: string
  name: string
  description: string | null
  image_url: string | null
  property_count: number
}

export interface MobileConfigurationData {
  bhk_options: Array<{ value: number; label: string }>
  property_types: Array<{ value: string; label: string }>
  price_ranges: Array<{ value: string; label: string; min: number; max: number | null }>
  total_configurations: number
}

export interface MobilePropertyData {
  id: string
  title: string
  description: string
  location: string
  location_data: Record<string, unknown>
  price: number | null
  bhk: number | null
  area: number | null
  bedrooms: number | null
  bathrooms: number | null
  image_url: string | null
  created_at: string
  property_collection: string | null
}

export interface MobileUserData {
  user: {
    id: string
    email: string
    name: string
  } | null
  profile: {
    id: string
    full_name: string
    email: string
    avatar: string | null
    role: string
    created_at: string
  } | null
  isAuthenticated: boolean
}

export interface MobileFooterData {
  contact: {
    email: string
    phone: string
    address: string
  }
  social: {
    facebook: string
    twitter: string
    instagram: string
    linkedin: string
    youtube: string
    tiktok: string
    whatsapp: string
  }
  website: string
}

// Server-side functions (for SSR) - only import when needed
export async function getMobileBrandingData(): Promise<MobileBrandingData> {
  try {
    // Dynamic import to avoid SSR issues in client components
    const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')
    const supabase = await createSupabaseAdminClient()
    
    const { data, error } = await supabase
      .from('settings')
      .select(`
        logo_url,
        company_name,
        company_tagline,
        site_title
      `)
      .single()
    
    if (error) {
      console.error('Error fetching mobile branding data:', error)
      return {
        logo_url: null,
        company_name: 'Property',
        company_tagline: 'Find your perfect home',
        site_title: 'Property Search'
      }
    }
    
    return {
      logo_url: data?.logo_url || null,
      company_name: data?.company_name || 'Property',
      company_tagline: data?.company_tagline || 'Find your perfect home',
      site_title: data?.site_title || 'Property Search'
    }
  } catch (error) {
    console.error('Error in getMobileBrandingData:', error)
    return {
      logo_url: null,
      company_name: 'Property',
      company_tagline: 'Find your perfect home',
      site_title: 'Property Search'
    }
  }
}

export async function getMobileLocationsData(): Promise<MobileLocationData[]> {
  try {
    // Dynamic import to avoid SSR issues in client components
    const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')
    const supabase = await createSupabaseAdminClient()
    
    const { data, error } = await supabase
      .from('property_locations')
      .select(`
        id,
        name,
        description,
        image_url
      `)
      .eq('is_active', true)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching mobile locations data:', error)
      return []
    }

    // Add property count for each location
    const locationsWithCount = await Promise.all(
      (data || []).map(async (location: { id: string; name: string; description: string | null; image_url: string | null }) => {
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
    
    return locationsWithCount
  } catch (error) {
    console.error('Error in getMobileLocationsData:', error)
    return []
  }
}

export async function getMobileUserData(): Promise<MobileUserData> {
  try {
    // Dynamic import to avoid SSR issues in client components
    const { createSupabaseApiClient } = await import('@/lib/supabase/api')
    const supabase = await createSupabaseApiClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        user: null,
        profile: null,
        isAuthenticated: false
      }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        avatar_data,
        role,
        created_at
      `)
      .eq('id', user.id)
      .single()

    if (profileError) {
      return {
        user: {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.email || 'Unknown User'
        },
        profile: null,
        isAuthenticated: true
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email || '',
        name: profile?.full_name || user.user_metadata?.full_name || user.email || 'Unknown User'
      },
      profile: {
        id: profile?.id || '',
        full_name: profile?.full_name || '',
        email: user.email || '',
        avatar: profile?.avatar_data,
        role: profile?.role || '',
        created_at: profile?.created_at || ''
      },
      isAuthenticated: true
    }
  } catch (error) {
    console.error('Error in getMobileUserData:', error)
    return {
      user: null,
      profile: null,
      isAuthenticated: false
    }
  }
}

// Client-side functions (for client components)
export async function getMobileBrandingDataClient(): Promise<MobileBrandingData> {
  try {
    const response = await fetch('/api/mobile/branding')
    if (!response.ok) {
      throw new Error('Failed to fetch mobile branding data')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching mobile branding data:', error)
    return {
      logo_url: null,
      company_name: 'Property',
      company_tagline: 'Find your perfect home',
      site_title: 'Property Search'
    }
  }
}

export async function getMobileLocationsDataClient(): Promise<MobileLocationData[]> {
  try {
    const response = await fetch('/api/mobile/locations')
    if (!response.ok) {
      throw new Error('Failed to fetch mobile locations data')
    }
    const data = await response.json()
    return data.locations || []
  } catch (error) {
    console.error('Error fetching mobile locations data:', error)
    return []
  }
}

export async function getMobileUserDataClient(): Promise<MobileUserData> {
  try {
    const response = await fetch('/api/mobile/user')
    if (!response.ok) {
      throw new Error('Failed to fetch mobile user data')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching mobile user data:', error)
    return {
      user: null,
      profile: null,
      isAuthenticated: false
    }
  }
} 