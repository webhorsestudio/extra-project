import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import PublicListingsPage from '@/components/web/public-listings/PublicListingsPage'

export default async function PublicListingsRoute() {
  const supabase = await createSupabaseAdminClient()
  
  // Fetch public listings data server-side
  const { data: listings, error } = await supabase
    .from('public_listings')
    .select('*')
    .eq('status', 'published')
    .or('expire_date.is.null,expire_date.gt.now()')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching public listings:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <PublicListingsPage initialListings={listings || []} />
        </div>
      </section>
    </div>
  )
}
