'use client'

import Image from 'next/image';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { FooterData } from '@/types/footer';

interface FooterProps {
  footerData: FooterData;
}

// Social media icons configuration
const SOCIAL_ICONS = [
  { key: 'facebook_url', icon: FaFacebook, label: 'Facebook' },
  { key: 'twitter_url', icon: FaTwitter, label: 'Twitter' },
  { key: 'linkedin_url', icon: FaLinkedin, label: 'LinkedIn' },
  { key: 'instagram_url', icon: FaInstagram, label: 'Instagram' },
  { key: 'youtube_url', icon: FaYoutube, label: 'YouTube' },
  { key: 'whatsapp_url', icon: FaWhatsapp, label: 'WhatsApp' },
] as const;

export default function Footer({ footerData }: FooterProps) {
  // Check if footer is enabled
  if (!footerData?.settings?.footer_enabled) {
    return null;
  }

  const { layout, content, logo } = footerData;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="px-4 py-8 space-y-6">
        {/* Logo and Company Info */}
        {layout.show_logo && (
          <div className="text-center mb-6">
            {logo.logo_url ? (
              <div className="flex justify-center mb-4">
                <Image
                  src={logo.logo_url}
                  alt={logo.logo_alt_text || content.company_name}
                  width={logo.logo_width || 160}
                  height={logo.logo_height || 60}
                  className="h-16 w-auto"
                />
              </div>
            ) : (
              <h2 className="text-2xl font-bold mb-3">{content.company_name}</h2>
            )}
            {content.company_tagline && (
              <p className="text-gray-300 text-base">{content.company_tagline}</p>
            )}
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <FaPhone className="text-gray-400" />
              <span>{content.contact_phone || "Contact us"}</span>
            </div>
            {content.contact_email && (
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-gray-400" />
                <span>{content.contact_email}</span>
              </div>
            )}
          </div>
          {content.contact_address && (
            <div className="flex items-center justify-center space-x-2 text-sm text-center">
              <FaMapMarkerAlt className="text-gray-400 flex-shrink-0 mt-1" />
              <span>{content.contact_address}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        {layout.show_social && (
          <div className="text-center">
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex justify-center space-x-6">
              {SOCIAL_ICONS.map(({ key, icon: Icon, label }) => {
                const url = content[key as keyof typeof content] as string;
                return url ? (
                  <a 
                    key={key}
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={label}
                  >
                    <Icon size={24} />
                  </a>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Copyright */}
        {layout.show_copyright && (
          <div className="text-center pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              {content.copyright_text || "© 2024 Extra Realty. All rights reserved."}
              {content.designed_by_text && (
                <span className="ml-2" dangerouslySetInnerHTML={{ __html: `| ${content.designed_by_text}` }} />
              )}
            </p>
          </div>
        )}
      </div>

      {/* Extra spacing to prevent overlap with footer navigation */}
      <div className="h-20"></div>
    </footer>
  );
} 