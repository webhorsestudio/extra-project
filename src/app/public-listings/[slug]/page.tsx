import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { PublicListingPage } from '@/components/web/public-listings/PublicListingPage'

interface PublicListingPageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicListingRoute({ params }: PublicListingPageProps) {
  const { slug } = await params
  const supabase = await createSupabaseAdminClient()
  
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

  return <PublicListingPage listing={listing} />
}
