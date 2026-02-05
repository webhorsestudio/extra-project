import { getBrandingData } from '@/lib/branding-server'
import { getPublicSettings } from '@/lib/settings'
import { getFooterData } from '@/lib/footer-data'
import EnquiryButton from './EnquiryButton'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import HeroSectionErrorFallback from './HeroSectionErrorFallback'

interface HeroSectionProps {
  initialBrandingData?: {
    logo_url?: string | null
    logo_alt?: string
    company_name?: string
    company_tagline?: string
  }
  initialSettings?: {
    site_title?: string
    meta_description?: string
    contact_email?: string
    contact_phone?: string
  }
  initialFooterData?: {
    content?: {
      whatsapp_url?: string
    }
  }
}

export default async function HeroSection({ 
  initialBrandingData,
  initialSettings,
  initialFooterData
}: HeroSectionProps) {
  console.log('HeroSection: Starting SSR data fetch')

  // Fetch data in parallel with error handling
  const [brandingDataResult, settingsDataResult, footerDataResult] = await Promise.allSettled([
    initialBrandingData ? Promise.resolve(initialBrandingData) : getBrandingData(),
    initialSettings ? Promise.resolve(initialSettings) : getPublicSettings(),
    initialFooterData ? Promise.resolve(initialFooterData) : getFooterData()
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

  console.log('HeroSection: Data fetch results:', {
    brandingData: brandingDataResult.status,
    settingsData: settingsDataResult.status,
    footerData: footerDataResult.status,
    companyName: brandingData.company_name
  })

  return (
    <ErrorBoundary fallback={HeroSectionErrorFallback}>
      <div className="relative bg-white w-screen flex flex-col justify-center items-center p-0 m-0 overflow-hidden py-12">
        <div className="w-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-center text-gray-900 mb-2">
            The Ultimate Address for your Luxury Homes
          </h1>
          <p className="text-base sm:text-lg text-center text-gray-700 mb-6">
            Discover the best homes for you & your family
          </p>
          <EnquiryButton 
            companyName={brandingData.company_name}
            contactEmail={settingsData?.contact_email || ''}
            contactPhone={settingsData?.contact_phone || ''}
            whatsappUrl={footerData?.content?.whatsapp_url || ''}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
} 