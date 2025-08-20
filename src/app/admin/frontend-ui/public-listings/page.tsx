import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import PublicListingsList from '@/components/admin/public-listings/PublicListingsList'

export default async function PublicListingsPage() {
  const supabase = await createSupabaseAdminClient()
  
  // Fetch public listings data server-side
  const { data: listings, error } = await supabase
    .from('public_listings')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching public listings:', error)
  }

  return (
    <div className="container py-6">
      <PublicListingsList initialListings={listings || []} />
    </div>
  )
}
