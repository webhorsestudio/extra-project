"use client"

import MobileHeader from './Header'
import FooterNav from './FooterNav'
import Footer from './Footer'
import MobileFilterModal from './MobileFilterModal'
import { useRef, useState, useEffect } from 'react'
import { FooterVisibleProvider } from './FooterVisibleContext'
import { FooterData } from '@/types/footer'
import { usePathname } from 'next/navigation'

interface MobileLayoutClientProps {
  children: React.ReactNode
  footerData?: FooterData | null
}

export default function MobileLayoutClient({ children, footerData }: MobileLayoutClientProps) {
  const pathname = usePathname()
  
  // Smart scroll hide/show logic for FooterNav
  const [footerVisible, setFooterVisible] = useState(true)
  const [isTablet, setIsTablet] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const lastScrollY = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Pages that don't need the header
  const pagesWithoutHeader = ['/m/profile', '/m/contact', '/m/support', '/m/terms', '/m/privacy', '/m/faqs', '/m/properties/[id]', '/m/blogs', '/m/blogs/[id]']

  const shouldShowHeader = !pagesWithoutHeader.includes(pathname) && !pathname.startsWith('/m/properties/') && !pathname.startsWith('/m/blogs/')

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
        setFooterVisible(false)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setFooterVisible(true)
        }, 300)
      }
      lastScrollY.current = currentScrollY
    }

    const handleResize = () => {
      const width = window.innerWidth
      setIsTablet(width >= 768 && width <= 1024)
    }

    // Initial check
    handleResize()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <FooterVisibleProvider value={footerVisible}>
      <div className="min-h-screen bg-white">
        {/* Full-width modern mobile layout */}
        <div className="min-h-screen flex flex-col relative">
          {/* Mobile Header - conditionally rendered */}
          {shouldShowHeader && (
            <MobileHeader isTablet={isTablet} onHeaderClick={() => setIsFilterModalOpen(true)} />
          )}
          {/* Main content area - full width with responsive padding */}
          <main className={`flex-1 pb-28 ${isTablet ? 'px-6' : 'px-4'}`}>
            {children}
          </main>
          {/* Footer */}
          {footerData && <Footer footerData={footerData} />}
          {/* Footer Navigation - Now included in layout */}
          {!pathname.startsWith('/m/properties/') && (
            <FooterNav visible={footerVisible} isTablet={isTablet} />
          )}
          {/* Mobile Filter Modal */}
          <MobileFilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            city="Mumbai"
          />
        </div>
      </div>
    </FooterVisibleProvider>
  )
}