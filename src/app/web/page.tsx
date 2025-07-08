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

// Add caching strategy - revalidate every hour
export const revalidate = 3600

export default async function HomePage() {
  console.log('HomePage: Starting SSR data fetch')

  // Fetch data in parallel with error handling
  const [brandingDataResult, settingsDataResult, footerDataResult, latestPropertiesResult] = await Promise.allSettled([
    getBrandingData(),
    getPublicSettings(),
    getFooterData(),
    getLatestProperties(20)
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

  console.log('HomePage: Data fetch results:', {
    brandingData: brandingDataResult.status,
    settingsData: settingsDataResult.status,
    footerData: footerDataResult.status,
    latestProperties: latestPropertiesResult.status,
    companyName: brandingData.company_name,
    latestPropertiesCount: latestProperties.length
  })

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <HeroSection 
        initialBrandingData={brandingData}
        initialSettings={settingsData}
        initialFooterData={footerData}
      />
      <LatestProperties properties={latestProperties} />
      <FeaturedProperties />
      <NewlyLaunchedProperties />
      <LocalitiesYouMayLike />
      <LatestBlogs />
    </div>
  );
} 