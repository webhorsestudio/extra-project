import { createSupabaseAdminUserClient } from '@/lib/supabase/admin'

export async function getFeaturedProperties() {
  const supabase = await createSupabaseAdminUserClient()
  
  console.log('Attempting to fetch featured properties...')
  
  const { data, error } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      description,
      location,
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
        image_url,
        display_order
      ),
      property_locations (
        id,
        name,
        description
      )
    `)
    .eq('property_collection', 'Featured')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  console.log('Supabase response for properties:', { data, error, hasData: !!data, hasError: !!error })

  if (error) {
    console.error('Error fetching featured properties:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    return []
  }

  console.log('Successfully fetched properties:', data?.length || 0, 'properties')

  return (data || []).map(property => ({
    ...property,
    price: property.property_configurations?.[0]?.price ?? null,
    location_data: property.property_locations
  }))
}

export async function getNewlyLaunchedProperties() {
  const supabase = await createSupabaseAdminUserClient()
  
  console.log('Attempting to fetch newly launched properties...')
  
  const { data, error } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      description,
      location,
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
        image_url,
        display_order
      ),
      property_locations (
        id,
        name,
        description
      )
    `)
    .eq('property_collection', 'Newly Launched')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  console.log('Supabase response for newly launched properties:', { data, error, hasData: !!data, hasError: !!error })

  if (error) {
    console.error('Error fetching newly launched properties:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    return []
  }

  console.log('Successfully fetched newly launched properties:', data?.length || 0, 'properties')

  return (data || []).map(property => ({
    ...property,
    price: property.property_configurations?.[0]?.price ?? null,
    location_data: property.property_locations
  }))
}

export async function getLatestProperties(limit = 20) {
  const supabase = await createSupabaseAdminUserClient()
  
  console.log('Attempting to fetch latest properties...')
  
  const { data, error } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      description,
      location,
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
    .order('created_at', { ascending: false })
    .limit(limit)

  console.log('Supabase response for latest properties:', { data, error, hasData: !!data, hasError: !!error })

  if (error) {
    console.error('Error fetching latest properties:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    return []
  }

  console.log('Successfully fetched latest properties:', data?.length || 0, 'properties')

  return (data || []).map(property => ({
    ...property,
    price: property.property_configurations?.[0]?.price ?? null,
    location_data: property.property_locations
  }))
}

export async function getLatestBlogs(limit = 3, retryCount = 0) {
  const supabase = await createSupabaseAdminUserClient()
  
  console.log(`Attempting to fetch latest blogs (attempt ${retryCount + 1})...`)
  
  try {
    const { data, error } = await supabase
      .from('blogs_with_categories')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit)

    console.log('Supabase response for blogs:', { 
      dataCount: data?.length || 0, 
      error: error?.message || null, 
      hasData: !!data, 
      hasError: !!error 
    })

    if (error) {
      console.error('Error fetching latest blogs:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // Retry logic for transient errors
      if (retryCount < 2 && (error.code === 'PGRST301' || error.code === 'PGRST302')) {
        console.log(`Retrying blog fetch (attempt ${retryCount + 2})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Exponential backoff
        return getLatestBlogs(limit, retryCount + 1)
      }
      
      return []
    }

    console.log('Successfully fetched blogs:', data?.length || 0, 'blogs')

    // Map the data to match the expected schema
    return (data || []).map(blog => ({
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      featured_image: blog.featured_image,
      created_at: blog.created_at,
      categories: blog.categories || []
    }))
  } catch (unexpectedError) {
    console.error('Unexpected error in getLatestBlogs:', unexpectedError)
    return []
  }
}

export async function getLogoUrl() {
  const supabase = await createSupabaseAdminUserClient()
  const { data, error } = await supabase
    .from('settings')
    .select('logo_url')
    .single()

  if (error) {
    console.error('Error fetching logo URL:', error)
    return null
  }

  return data?.logo_url || null
}

export async function getWebsiteInfo() {
  const supabase = await createSupabaseAdminUserClient()
  const { data, error } = await supabase
    .from('settings')
    .select('contact_email, contact_phone, contact_address, contact_website')
    .single()

  if (error) {
    console.error('Error fetching website info:', error)
    return {
      contact_email: '',
      contact_phone: '',
      contact_address: '',
      contact_website: ''
    }
  }

  return data || {
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    contact_website: ''
  }
} 