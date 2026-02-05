import { checkAdminAuth } from '@/lib/admin-data'
import { createSupabaseAdminUserClient } from '@/lib/supabase/admin'
import AmenitiesClient from './AmenitiesClient'

export default async function AmenitiesPage() {
  // Check admin authentication
  await checkAdminAuth()
  
  const supabase = await createSupabaseAdminUserClient()
  
  try {
    const { data: amenities, error } = await supabase
      .from('property_amenities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching amenities:', error)
      return <AmenitiesClient amenities={[]} />
    }

    return <AmenitiesClient amenities={amenities || []} />
  } catch (error) {
    console.error('Error in AmenitiesPage:', error)
    return <AmenitiesClient amenities={[]} />
  }
} 
