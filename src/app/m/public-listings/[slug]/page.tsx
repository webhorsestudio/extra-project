import { notFound } from 'next/navigation'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { MobilePublicListingPage } from '@/components/mobile/public-listings/MobilePublicListingPage'

interface MobilePublicListingPageProps {
  params: Promise<{ slug: string }>
}

export default async function MobilePublicListingRoute({ params }: MobilePublicListingPageProps) {
  const { slug } = await params
  const supabase = await createSupabaseApiClient()
  
  // Fetch specific listing by slug
  const { data: listing, error } = await supabase
    .from('public_listings')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .or('expire_date.is.null,expire_date.gt.now()')
    .single()

  if (error || !listing) {
    notFound()
  }

  return <MobilePublicListingPage listing={listing} />
}
