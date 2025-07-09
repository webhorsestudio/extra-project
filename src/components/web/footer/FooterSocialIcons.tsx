'use client'
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa'

interface FooterSocialIconsProps {
  facebookUrl?: string
  twitterUrl?: string
  linkedinUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  whatsappUrl?: string
  linkColor?: string
  linkHoverColor?: string
}

export default function FooterSocialIcons({ 
  facebookUrl,
  twitterUrl,
  linkedinUrl,
  instagramUrl,
  youtubeUrl,
  whatsappUrl,
  linkColor = '#9ca3af',
  linkHoverColor = '#ffffff'
}: FooterSocialIconsProps) {
  const socialLinks = [
    { 
      name: 'Facebook', 
      url: facebookUrl, 
      icon: FaFacebookF,
      isActive: !!facebookUrl
    },
    { 
      name: 'Twitter', 
      url: twitterUrl, 
      icon: FaTwitter,
      isActive: !!twitterUrl
    },
    { 
      name: 'LinkedIn', 
      url: linkedinUrl, 
      icon: FaLinkedinIn,
      isActive: !!linkedinUrl
    },
    { 
      name: 'Instagram', 
      url: instagramUrl, 
      icon: FaInstagram,
      isActive: !!instagramUrl
    },
    { 
      name: 'YouTube', 
      url: youtubeUrl, 
      icon: FaYoutube,
      isActive: !!youtubeUrl
    },
    { 
      name: 'WhatsApp', 
      url: whatsappUrl, 
      icon: FaWhatsapp,
      isActive: !!whatsappUrl
    }
  ]

  // Filter to only show active social links
  const activeLinks = socialLinks.filter(link => link.isActive)

  if (activeLinks.length === 0) {
    return null
  }

  return (
    <div className="flex space-x-4">
      {activeLinks.map(link => {
        const Icon = link.icon
        return (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center transition-colors"
            style={{ 
              color: linkColor,
              backgroundColor: 'rgba(31, 41, 55, 0.8)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = linkHoverColor
              e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = linkColor
              e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)'
            }}
            aria-label={`Follow us on ${link.name}`}
          >
            <Icon size={16} />
          </a>
        )
      })}
    </div>
  )
} 