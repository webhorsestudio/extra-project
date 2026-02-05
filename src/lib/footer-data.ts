export interface FooterData {
  // Layout settings
  layout: {
    column_layout: string
    show_logo: boolean
    show_navigation: boolean
    show_contact: boolean
    show_social: boolean
    show_cta: boolean
    show_policy_links: boolean
    show_copyright: boolean
    spacing: string
    alignment: string
  }
  
  // Content settings
  content: {
    company_name: string
    company_tagline: string
    company_description: string
    contact_phone: string
    contact_email: string
    contact_address: string
    contact_website: string
    facebook_url: string
    twitter_url: string
    linkedin_url: string
    instagram_url: string
    youtube_url: string
    whatsapp_url: string
    cta_title: string
    cta_subtitle: string
    cta_button_text: string
    cta_button_url: string
    copyright_text: string
    designed_by_text: string
    footer_main_title: string
    footer_main_subtitle: string
    navigation_columns: Array<{
      title: string
      links: Array<{
        label: string
        href: string
        isActive: boolean
      }>
    }>
    policy_links: Array<{
      label: string
      href: string
      isActive: boolean
    }>
  }
  
  // Styling settings
  styling: {
    background_color: string
    text_color: string
    link_color: string
    link_hover_color: string
    border_color: string
    accent_color: string
    heading_font_size: string
    body_font_size: string
    link_font_size: string
    font_weight: string
    line_height: string
    padding_top: string
    padding_bottom: string
    padding_x: string
    section_spacing: string
    column_gap: string
    show_shadows: boolean
    show_borders: boolean
    rounded_corners: boolean
    border_width: string
    shadow_intensity: string
    background_gradient: boolean
    gradient_from: string
    gradient_to: string
    background_opacity: string
    enable_animations: boolean
    transition_duration: string
    hover_effects: boolean
  }
  
  // Logo settings
  logo: {
    logo_url: string | null
    logo_storage_path: string | null
    logo_filename: string | null
    logo_file_size: number | null
    logo_mime_type: string | null
    logo_alt_text: string
    logo_width: number
    logo_height: number
    show_logo: boolean
    link_to_home: boolean
    logo_style: string
    custom_css: string | null
  }
  
  // General settings
  settings: {
    footer_enabled: boolean
    footer_position: string
    footer_behavior: string
    footer_width: string
    max_width: string
    show_on_mobile: boolean
    show_on_tablet: boolean
    show_on_desktop: boolean
    mobile_collapsible: boolean
    tablet_collapsible: boolean
    lazy_load: boolean
    preload_critical: boolean
    cache_duration: number
    enable_analytics: boolean
    structured_data: boolean
    schema_type: string
    enable_aria_labels: boolean
    skip_to_content: boolean
    focus_indicators: boolean
    google_analytics_id: string | null
    facebook_pixel_id: string | null
    hotjar_id: string | null
    custom_tracking_code: string | null
    custom_css: string | null
    custom_js: string | null
    enable_debug_mode: boolean
    enable_console_logs: boolean
    enable_performance_monitoring: boolean
    backup_settings: boolean
    auto_backup_frequency: string
    settings_version: string
    backup_retention_days: number
  }
}

// Server-side version (for SSR) - import only when needed
export async function getFooterData(): Promise<FooterData> {
  try {
    // Dynamic import to avoid SSR issues in client components
    const { createSupabaseApiClient } = await import('@/lib/supabase/api')
    const supabase = await createSupabaseApiClient()
    

    
    // Fetch all footer data in parallel using Supabase directly
    const [layoutRes, contentRes, stylingRes, logoRes, settingsRes] = await Promise.allSettled([
      supabase.from('footer_layout').select('*').single(),
      supabase.from('footer_content').select('*').single(),
      supabase.from('footer_styling').select('*').single(),
      supabase.from('footer_logo').select('*').single(),
      supabase.from('footer_settings').select('*').single()
    ])

    // Extract data with fallbacks
    const layout = layoutRes.status === 'fulfilled' && layoutRes.value.data
      ? layoutRes.value.data 
      : getDefaultLayout()

    const content = contentRes.status === 'fulfilled' && contentRes.value.data
      ? contentRes.value.data
      : getDefaultContent()

    const styling = stylingRes.status === 'fulfilled' && stylingRes.value.data
      ? stylingRes.value.data
      : getDefaultStyling()

    const logo = logoRes.status === 'fulfilled' && logoRes.value.data
      ? logoRes.value.data
      : getDefaultLogo()

    const settings = settingsRes.status === 'fulfilled' && settingsRes.value.data
      ? settingsRes.value.data
      : getDefaultSettings()

    return {
      layout,
      content,
      styling,
      logo,
      settings
    }
  } catch (error) {
    console.error('Error fetching footer data:', error)
    
    // Return default data if all fetches fail
    return {
      layout: getDefaultLayout(),
      content: getDefaultContent(),
      styling: getDefaultStyling(),
      logo: getDefaultLogo(),
      settings: getDefaultSettings()
    }
  }
}

// Client-side version (for client components)
export async function getFooterDataClient(): Promise<FooterData> {
  try {
    // Fetch all footer data in parallel using fetch (client-safe)
    const [layoutRes, contentRes, stylingRes, logoRes, settingsRes] = await Promise.allSettled([
      fetch('/api/admin/footer/layout'),
      fetch('/api/admin/footer/content'),
      fetch('/api/admin/footer/styling'),
      fetch('/api/admin/footer/logo'),
      fetch('/api/admin/footer/settings')
    ])

    // Extract data with fallbacks
    const layout = layoutRes.status === 'fulfilled' && layoutRes.value.ok 
      ? (await layoutRes.value.json()).layout 
      : getDefaultLayout()

    const content = contentRes.status === 'fulfilled' && contentRes.value.ok
      ? (await contentRes.value.json()).content
      : getDefaultContent()

    const styling = stylingRes.status === 'fulfilled' && stylingRes.value.ok
      ? (await stylingRes.value.json()).styling
      : getDefaultStyling()

    const logo = logoRes.status === 'fulfilled' && logoRes.value.ok
      ? (await logoRes.value.json()).logo
      : getDefaultLogo()

    const settings = settingsRes.status === 'fulfilled' && settingsRes.value.ok
      ? (await settingsRes.value.json()).settings
      : getDefaultSettings()

    return {
      layout,
      content,
      styling,
      logo,
      settings
    }
  } catch (error) {
    console.error('Error fetching footer data:', error)
    
    // Return default data if all fetches fail
    return {
      layout: getDefaultLayout(),
      content: getDefaultContent(),
      styling: getDefaultStyling(),
      logo: getDefaultLogo(),
      settings: getDefaultSettings()
    }
  }
}

// Default data functions
function getDefaultLayout() {
  return {
    column_layout: '3',
    show_logo: true,
    show_navigation: true,
    show_contact: true,
    show_social: true,
    show_cta: true,
    show_policy_links: true,
    show_copyright: true,
    spacing: 'normal',
    alignment: 'left'
  }
}

function getDefaultContent() {
  return {
    company_name: 'Extra Realty Private Limited',
    company_tagline: 'Empowering Real Estate Excellence',
    company_description: 'Your trusted partner in finding the perfect property.',
    contact_phone: '+91 96068 99667',
    contact_email: 'info@extrareality.com',
    contact_address: 'B802, Central Park, Andheri(E), Mumbai - 400069, Maharashtra',
    contact_website: 'https://extrareality.com',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    instagram_url: '',
    youtube_url: '',
    whatsapp_url: '',
    cta_title: 'Ready to Find Your Dream Home?',
    cta_subtitle: 'Get in touch with our expert team today',
    cta_button_text: 'Contact Us',
    cta_button_url: '/contact',
    copyright_text: '© 2025 Extra Realty Private Limited - All Rights Reserved',
    designed_by_text: 'Designed by <a href="https://webhorsestudio.com" target="_blank">Webhorse Studio</a>',
    footer_main_title: 'Searching for your Dream Home?',
    footer_main_subtitle: 'GET IN TOUCH WITH OUR EXPERT TEAM TODAY',
    navigation_columns: [
      {
        title: 'Company',
        links: [
          { label: 'About Us', href: '/about', isActive: true },
          { label: 'Contact Us', href: '/contact', isActive: true },
          { label: 'Careers', href: '/careers', isActive: false }
        ]
      },
      {
        title: 'Services',
        links: [
          { label: 'Buy Property', href: '/buy', isActive: true },
          { label: 'Sell Property', href: '/sell', isActive: true },
          { label: 'Rent Property', href: '/rent', isActive: true }
        ]
      },
      {
        title: 'Support',
        links: [
          { label: 'FAQs', href: '/faqs', isActive: true },
          { label: 'Help Center', href: '/help', isActive: false },
          { label: 'Contact Support', href: '/support', isActive: true }
        ]
      }
    ],
    policy_links: [
      { label: 'Privacy Policy', href: '/privacy', isActive: true },
      { label: 'Terms of Service', href: '/terms', isActive: true },
      { label: 'Cookie Policy', href: '/cookies', isActive: true },
      { label: 'Refund Policy', href: '/refund', isActive: false }
    ]
  }
}

function getDefaultStyling() {
  return {
    background_color: '#000000',
    text_color: '#ffffff',
    link_color: '#9ca3af',
    link_hover_color: '#ffffff',
    border_color: '#374151',
    accent_color: '#06b6d4',
    heading_font_size: 'text-sm',
    body_font_size: 'text-sm',
    link_font_size: 'text-sm',
    font_weight: 'font-medium',
    line_height: 'leading-relaxed',
    padding_top: 'pt-24',
    padding_bottom: 'pb-12',
    padding_x: 'px-6',
    section_spacing: 'space-y-6',
    column_gap: 'gap-12',
    show_shadows: true,
    show_borders: true,
    rounded_corners: false,
    border_width: 'border',
    shadow_intensity: 'shadow-lg',
    background_gradient: true,
    gradient_from: 'from-neutral-900',
    gradient_to: 'to-black',
    background_opacity: 'bg-opacity-100',
    enable_animations: true,
    transition_duration: 'duration-300',
    hover_effects: true
  }
}

function getDefaultLogo() {
  return {
    logo_url: null,
    logo_storage_path: null,
    logo_filename: null,
    logo_file_size: null,
    logo_mime_type: null,
    logo_alt_text: 'Footer Logo',
    logo_width: 180,
    logo_height: 56,
    show_logo: true,
    link_to_home: true,
    logo_style: 'default',
    custom_css: null
  }
}

function getDefaultSettings() {
  return {
    footer_enabled: true,
    footer_position: 'bottom',
    footer_behavior: 'normal',
    footer_width: 'full',
    max_width: 'max-w-7xl',
    show_on_mobile: true,
    show_on_tablet: true,
    show_on_desktop: true,
    mobile_collapsible: false,
    tablet_collapsible: false,
    lazy_load: false,
    preload_critical: true,
    cache_duration: 3600,
    enable_analytics: true,
    structured_data: true,
    schema_type: 'Organization',
    enable_aria_labels: true,
    skip_to_content: true,
    focus_indicators: true,
    google_analytics_id: null,
    facebook_pixel_id: null,
    hotjar_id: null,
    custom_tracking_code: null,
    custom_css: null,
    custom_js: null,
    enable_debug_mode: false,
    enable_console_logs: false,
    enable_performance_monitoring: false,
    backup_settings: true,
    auto_backup_frequency: 'weekly',
    settings_version: '1.0.0',
    backup_retention_days: 30
  }
} 