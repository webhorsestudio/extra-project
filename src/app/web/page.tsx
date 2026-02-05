import { getBrandingData } from '@/lib/branding-server'
import { getPublicSettings } from '@/lib/settings'
import { getFooterData } from '@/lib/footer-data'
import { getLatestProperties } from '@/lib/data'
import HeroSection from "@/components/web/HeroSection";
import FeaturedProperties from "@/components/web/FeaturedProperties";
import NewlyLaunchedProperties from "@/components/web/NewlyLaunchedProperties";
import LocalitiesYouMayLike from "@/components/web/LocalitiesYouMayLike";
import LatestProperties from "@/components/web/LatestProperties";
import LatestBlogs from "@/components/web/LatestBlogs";
import TestimonialsSection from "@/components/web/TestimonialsSection";
import { getActiveTestimonials } from "@/lib/testimonials-data-server";
import type { Property } from '@/types/property';
import type { Testimonial } from '@/types/testimonial';
import { generateHomeMetadata, getSEOConfig, generateWebsiteStructuredData, generateOrganizationStructuredData, getOrganizationData } from '@/lib/seo';
import { Metadata } from 'next';

// Add caching strategy - revalidate every hour
export const revalidate = 3600

// Generate SEO metadata for home page
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch data for metadata generation
    const [seoConfig, latestPropertiesResult, organizationData] = await Promise.allSettled([
      getSEOConfig(),
      getLatestProperties(20),
      getOrganizationData()
    ])

    const config = seoConfig.status === 'fulfilled' ? seoConfig.value : null
    const latestProperties = latestPropertiesResult.status === 'fulfilled' ? latestPropertiesResult.value : []
    const orgData = organizationData.status === 'fulfilled' ? organizationData.value : null

    // Generate base metadata
    const metadata = generateHomeMetadata(latestProperties, config || undefined)

    // Add structured data
    const structuredData = []
    
    // Add website structured data
    if (config) {
      structuredData.push(generateWebsiteStructuredData(config))
    }

    // Add organization structured data
    if (orgData) {
      structuredData.push(generateOrganizationStructuredData(orgData, config || undefined))
    }

    // Add structured data to metadata
    if (structuredData.length > 0) {
      metadata.other = {
        'application/ld+json': JSON.stringify(structuredData.length === 1 ? structuredData[0] : structuredData)
      }
    }

    return metadata
  } catch (error) {
    console.error('Error generating home page metadata:', error)
    // Return fallback metadata
    return generateHomeMetadata()
  }
}

export default async function HomePage() {
  console.log('HomePage: Starting SSR data fetch')

  // Fetch data in parallel with error handling
  const [brandingDataResult, settingsDataResult, footerDataResult, latestPropertiesResult, testimonialsResult] = await Promise.allSettled([
    getBrandingData(),
    getPublicSettings(),
    getFooterData(),
    getLatestProperties(20),
    getActiveTestimonials()
  ])

  // Extract data with fallbacks
  const brandingData = brandingDataResult.status === 'fulfilled' ? brandingDataResult.value : {
    logo_url: null,
    logo_alt: 'Extra Realty',
    company_name: 'Extra Realty Private Limited',
    company_tagline: 'Empowering Real Estate Excellence'
  }

  const settingsData = settingsDataResult.status === 'fulfilled' && settingsDataResult.value ? settingsDataResult.value : {
    site_title: 'Extra Realty Private Limited',
    meta_description: 'Discover the best homes for you & your family',
    contact_email: '',
    contact_phone: ''
  }

  const footerData = footerDataResult.status === 'fulfilled' ? footerDataResult.value : {
    content: {
      whatsapp_url: ''
    }
  }

  const latestProperties = latestPropertiesResult.status === 'fulfilled' ? latestPropertiesResult.value : []
  const testimonials: Testimonial[] = testimonialsResult.status === 'fulfilled' ? testimonialsResult.value : []

  // When mapping latestProperties for LatestProperties, ensure all required fields are present
  const allowedTypes = ['Apartment', 'House', 'Commercial', 'Land', 'Villa', 'Penthouse'];
  const allowedCollections = ['Newly Launched', 'Featured', 'Ready to Move', 'Under Construction'];

  const mappedLatestProperties: Property[] = (latestProperties || []).map((prop: Record<string, unknown>) => {
    const property_type = (
      typeof prop.property_type === 'string' && allowedTypes.includes(prop.property_type)
        ? prop.property_type
        : 'Apartment'
    ) as Property['property_type'];
    const property_collection = (
      typeof prop.property_collection === 'string' && allowedCollections.includes(prop.property_collection)
        ? prop.property_collection
        : 'Featured'
    ) as Property['property_collection'];
    const property_nature = (
      typeof prop.property_nature === 'string' && ['Sell', 'Rent'].includes(prop.property_nature)
        ? prop.property_nature
        : 'Sell'
    ) as Property['property_nature'];
    const property_configurations = Array.isArray(prop.property_configurations) ? prop.property_configurations : [];
    const property_images = Array.isArray(prop.property_images) ? prop.property_images : [];
    return {
      id: prop.id as string,
      slug: prop.slug as string || prop.id as string, // Include slug field
      title: prop.title as string,
      description: prop.description as string || '',
      property_type,
      property_nature,
      property_collection,
      location: prop.location as string || '',
      latitude: typeof prop.latitude === 'number' ? prop.latitude : 0,
      longitude: typeof prop.longitude === 'number' ? prop.longitude : 0,
      created_at: prop.created_at as string || '',
      updated_at: (prop.updated_at as string) || (prop.created_at as string) || '',
      created_by: (prop.created_by as string) || '',
      posted_by: (prop.posted_by as string) || '',
      developer_id: typeof prop.developer_id === 'string' ? prop.developer_id : undefined,
      parking: typeof prop.parking === 'boolean' ? prop.parking : false,
      parking_spots: typeof prop.parking_spots === 'number' ? prop.parking_spots : undefined,
      rera_number: typeof prop.rera_number === 'string' ? prop.rera_number : null,
      status: typeof prop.status === 'string' ? prop.status : 'active',
      is_verified: typeof prop.is_verified === 'boolean' ? prop.is_verified : false,
      location_data: Array.isArray(prop.property_locations) ? prop.property_locations[0] : prop.property_locations,
      property_images,
      property_configurations,
      amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
      categories: Array.isArray(prop.categories) ? prop.categories : [],
      property_amenities: [],
      property_categories: [],
      property_views: [],
      property_favorites: [],
      view_count: 0,
      favorite_count: 0,
    };
  });

  console.log('HomePage: Data fetch results:', {
    brandingData: brandingDataResult.status,
    settingsData: settingsDataResult.status,
    footerData: footerDataResult.status,
    latestProperties: latestPropertiesResult.status,
    testimonials: testimonialsResult.status,
    companyName: brandingData.company_name,
    latestPropertiesCount: latestProperties.length,
    testimonialsCount: testimonials.length
  })

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <HeroSection 
        initialBrandingData={brandingData}
        initialSettings={settingsData}
        initialFooterData={footerData}
      />
      <LatestProperties properties={mappedLatestProperties} />
      <FeaturedProperties />
      <NewlyLaunchedProperties />
      <LocalitiesYouMayLike />
      <TestimonialsSection
        testimonials={testimonials.map((testimonial) => ({
          id: testimonial.id,
          quote: testimonial.quote,
          name: testimonial.name,
          title: testimonial.title,
          avatar_url: testimonial.avatar_url,
        }))}
      />
      <LatestBlogs />
    </div>
  );
} 