import { getBrandingData } from '@/lib/branding-server'
import { LoginPage } from './LoginPageClient'

export default async function Page() {
  const branding = await getBrandingData()
  
  // Transform branding data to match expected type (null -> undefined)
  const transformedBranding = {
    logo_url: branding.logo_url || undefined,
    logo_alt: branding.logo_alt || undefined,
    company_name: branding.company_name || undefined,
    company_tagline: branding.company_tagline || undefined,
  }
  
  return <LoginPage branding={transformedBranding} />
} 