import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { PublicListingPage } from '@/components/web/public-listings/PublicListingPage'
import { generatePublicListingMetadata, generateArticleStructuredData, getSEOConfig } from '@/lib/seo'
// import { PublicListingBreadcrumbs } from '@/components/seo/Breadcrumbs'
// import { RelatedPublicListings } from '@/components/seo/RelatedContent'
import { Metadata } from 'next'

interface PublicListingPageProps {
  params: Promise<{ slug: string }>
}

// Generate SEO metadata for public listing page
export async function generateMetadata({ params }: PublicListingPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const supabase = await createSupabaseAdminClient()
    
    // Fetch listing data for metadata
    const { data: listing, error } = await supabase
      .from('public_listings')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .or('expire_date.is.null,expire_date.gt.now()')
      .single()

    if (error || !listing) {
      return {
        title: 'Listing Not Found',
        description: 'The requested listing could not be found.',
      }
    }

    // Get SEO configuration
    const seoConfig = await getSEOConfig()

    // Generate metadata
    const metadata = generatePublicListingMetadata(listing, seoConfig)

    // Add structured data (treat as article)
    const articleData = {
      title: listing.title,
      description: listing.excerpt || 'Property listing and updates',
      slug: listing.slug,
      author: 'Extra Realty Team',
      created_at: listing.created_at,
      updated_at: listing.updated_at,
      featured_image: listing.featured_image_url,
      categories: [listing.type],
    }

    const structuredData = generateArticleStructuredData(articleData, seoConfig)
    
    metadata.other = {
      'application/ld+json': JSON.stringify(structuredData)
    }

    return metadata
  } catch (error) {
    console.error('Error generating public listing metadata:', error)
    return {
      title: 'Property Listing',
      description: 'View the latest property listing and updates.',
    }
  }
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
