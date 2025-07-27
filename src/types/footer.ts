// Footer-related TypeScript interfaces

export interface FooterLogo {
  logo_url: string | null
  logo_alt_text: string
  logo_width: number
  logo_height: number
}

export interface FooterContent {
  company_name: string
  company_tagline: string
  contact_phone: string
  contact_email: string
  contact_address: string
  facebook_url: string
  twitter_url: string
  linkedin_url: string
  instagram_url: string
  youtube_url: string
  whatsapp_url: string
  copyright_text: string
  designed_by_text: string
  footer_main_title: string
  footer_main_subtitle: string
}

export interface FooterLayout {
  show_logo: boolean
  show_social: boolean
  show_copyright: boolean
}

export interface FooterSettings {
  footer_enabled: boolean
}

export interface FooterData {
  layout: FooterLayout
  content: FooterContent
  logo: FooterLogo
  settings: FooterSettings
} 