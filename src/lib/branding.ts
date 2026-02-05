export interface LogoInfo {
  logo_url: string | null
  logo_alt_text: string
  logo_storage_path: string | null
  has_logo: boolean
}

export interface BrandingData {
  logo_url: string | null
  logo_alt: string
  company_name: string
  company_tagline: string
}

// Re-export the getLogoInfo function from branding-server
export { getLogoInfo } from './branding-server' 