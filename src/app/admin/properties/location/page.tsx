import { checkAdminAuth } from '@/lib/admin-data'
import { createSupabaseAdminUserClient } from '@/lib/supabase/admin'
import LocationClient from './LocationClient'

export default async function LocationPage() {
  await checkAdminAuth()
  const supabase = await createSupabaseAdminUserClient()

  let locations = []
  try {
    const { data, error } = await supabase
      .from('property_locations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching locations:', error)
    } else {
      locations = data || []
    }
  } catch (err) {
    console.error('Exception fetching locations:', err)
  }

  return <LocationClient locations={locations} />
} 
