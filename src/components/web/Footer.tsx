import FooterLogo from './footer/FooterLogo'
import FooterNavColumns from './footer/FooterNavColumns'
import FooterLetsTalk from './footer/FooterLetsTalk'
import FooterPolicyLinks from './footer/FooterPolicyLinks'
import FooterSocialIcons from './footer/FooterSocialIcons'
import FooterCTA from './footer/FooterCTA'

interface FooterProps {
  footerData: any // Make it required and remove async type
}

export default function Footer({ footerData }: FooterProps) {
  // Use the provided footer data directly
  const data = footerData
  
  // Check if footer is enabled
  if (!data?.settings?.footer_enabled) {
    return null
  }

  // Build dynamic CSS classes based on styling settings
  const footerClasses = [
    'relative',
    data.styling.padding_top,
    data.styling.padding_bottom,
    data.styling.padding_x,
    data.styling.text_color === '#ffffff' ? 'text-white' : 'text-black',
    data.styling.enable_animations ? 'transition-all' : '',
    data.styling.transition_duration || 'duration-300'
  ].join(' ')

  // Build background styles
  const backgroundStyle = {
    backgroundColor: data.styling.background_color,
    backgroundImage: data.styling.background_gradient 
      ? `linear-gradient(to bottom, ${data.styling.gradient_from}, ${data.styling.gradient_to})`
      : undefined
  }

  // Build container classes based on layout settings
  const containerClasses = [
    'container mx-auto',
    data.settings.max_width || 'max-w-7xl',
    data.styling.padding_x,
    data.styling.column_gap || 'gap-12'
  ].join(' ')

  return (
    <footer 
      className={footerClasses}
      style={backgroundStyle}
      data-footer-enabled={data.settings.footer_enabled}
      data-footer-position={data.settings.footer_position}
      data-footer-behavior={data.settings.footer_behavior}
    >
      {/* Call-to-Action Section */}
      {data.layout.show_cta && (
        <div className="relative z-20 -mt-16 mb-8">
          <FooterCTA 
            title={data.content.cta_title}
            subtitle={data.content.cta_subtitle}
            buttonText={data.content.cta_button_text}
            buttonUrl={data.content.cta_button_url}
          />
        </div>
      )}

      {/* Main Footer Content */}
      <div className={`${containerClasses} pt-20 pb-12 flex flex-col md:flex-row md:items-start md:justify-between`}>
        {/* Left: Logo + Nav Columns */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 flex-1">
          <div className="mb-8 md:mb-0">
            {data.layout.show_logo && (
              <div className="mb-8">
                <FooterLogo 
                  logoUrl={data.logo.logo_url}
                  logoAlt={data.logo.logo_alt_text}
                  logoWidth={data.logo.logo_width}
                  logoHeight={data.logo.logo_height}
                  linkToHome={data.logo.link_to_home}
                  companyName={data.content.company_name}
                />
              </div>
            )}
            {data.layout.show_navigation && (
              <FooterNavColumns 
                columns={data.content.navigation_columns}
                columnLayout={data.layout.column_layout}
                alignment={data.layout.alignment}
              />
            )}
          </div>
        </div>
        
        {/* Right: Let's Talk */}
        {data.layout.show_contact && (
          <div className="flex-1 flex items-center justify-end">
            <FooterLetsTalk 
              title={data.content.cta_title}
              subtitle={data.content.cta_subtitle}
            />
          </div>
        )}
      </div>

      {/* Divider */}
      {data.styling.show_borders && (
        <div 
          className={`border-t ${data.styling.border_width} my-6 mx-auto max-w-6xl`}
          style={{ borderColor: data.styling.border_color }}
        />
      )}

      {/* Bottom Row */}
      <div className={`${containerClasses} pb-8 flex flex-col md:flex-row items-center justify-between gap-6`}>
        {data.layout.show_policy_links && (
          <FooterPolicyLinks 
            links={data.content.policy_links}
            linkColor={data.styling.link_color}
            linkHoverColor={data.styling.link_hover_color}
          />
        )}
        {data.layout.show_social && (
          <FooterSocialIcons 
            facebookUrl={data.content.facebook_url}
            twitterUrl={data.content.twitter_url}
            linkedinUrl={data.content.linkedin_url}
            instagramUrl={data.content.instagram_url}
            youtubeUrl={data.content.youtube_url}
            whatsappUrl={data.content.whatsapp_url}
            linkColor={data.styling.link_color}
            linkHoverColor={data.styling.link_hover_color}
          />
        )}
      </div>

      {/* Copyright */}
      {data.layout.show_copyright && (
        <div 
          className={`border-t ${data.styling.border_width} py-4 text-center text-xs`}
          style={{ 
            borderColor: data.styling.border_color,
            color: data.styling.link_color 
          }}
        >
          <span>{data.content.copyright_text}</span>
          {data.content.designed_by_text && (
            <span className="ml-2">| {data.content.designed_by_text}</span>
          )}
        </div>
      )}

      {/* Custom CSS and JS */}
      {data.settings.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: data.settings.custom_css }} />
      )}
      {data.settings.custom_js && (
        <script dangerouslySetInnerHTML={{ __html: data.settings.custom_js }} />
      )}
    </footer>
  )
} 