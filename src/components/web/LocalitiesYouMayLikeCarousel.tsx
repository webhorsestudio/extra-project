"use client"

import { MapPin, Building2 } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import type { LocationData } from '@/lib/locations-data-server'
import Link from 'next/link'

interface Props {
  locations: LocationData[]
}

export default function ClientLocalitiesCarousel({ locations }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [cardsPerPage, setCardsPerPage] = useState(3)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    function updateCardsPerPage() {
      if (!containerRef.current) return
      const width = containerRef.current.offsetWidth
      if (width < 600) setCardsPerPage(1)
      else if (width < 900) setCardsPerPage(2)
      else setCardsPerPage(3)
    }
    updateCardsPerPage()
    window.addEventListener('resize', updateCardsPerPage)
    return () => window.removeEventListener('resize', updateCardsPerPage)
  }, [])

  const totalPages = Math.ceil(locations.length / cardsPerPage)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeft(scrollLeft > 0)
      setShowRight(scrollLeft < scrollWidth - clientWidth - 1)
      setCurrentPage(Math.round(scrollLeft / clientWidth))
    }
  }

  useEffect(() => {
    if (isHydrated) {
      checkScroll()
      const handleResize = () => {
        setTimeout(checkScroll, 100)
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [locations, isHydrated, cardsPerPage])

  useEffect(() => {
    if (isHydrated) {
      const scrollContainer = scrollRef.current
      if (scrollContainer) {
        const handleScroll = () => {
          checkScroll()
        }
        scrollContainer.addEventListener('scroll', handleScroll)
        return () => scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isHydrated])

  const scrollLeft = () => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current
      scrollRef.current.scrollBy({ left: -clientWidth, behavior: 'smooth' })
    }
  }
  const scrollRight = () => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current
      scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' })
    }
  }
  const scrollToPage = (idx: number) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current
      scrollRef.current.scrollTo({ left: idx * clientWidth, behavior: 'smooth' })
    }
  }

  if (!locations || locations.length === 0) {
    return null
  }

  // Don't render carousel controls until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div ref={containerRef} className="relative">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'auto', msOverflowStyle: 'auto' }}
        >
          {locations.map((loc) => (
            <Link
              key={loc.id}
              href={`/properties?location=${loc.id}&locationName=${encodeURIComponent(loc.name)}`}
              className="flex flex-col items-start bg-white rounded-xl px-8 py-6 w-96 shadow border border-gray-100 hover:shadow-lg hover:border-blue-400 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {/* First row: Number of properties */}
              <div className="flex items-center gap-2 mb-3 text-gray-700 w-full">
                <Building2 className="h-5 w-5 text-blue-700 flex-shrink-0" />
                <span className="font-semibold text-base text-gray-900 truncate">
                  {loc.property_count} {loc.property_count === 1 ? 'property' : 'properties'}
                </span>
              </div>
              {/* Second row: Location name */}
              <div className="flex items-center gap-2 text-gray-600 w-full">
                <MapPin className="h-5 w-5 text-blue-700 flex-shrink-0" />
                <span className="font-medium text-base truncate">{loc.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Container with 6.25 cards visible initially */}
      <div 
        className="overflow-hidden"
        style={{
          // Show 6.25 cards initially (6 full + 0.25 partial)
          width: 'calc(6.25 * (384px + 24px) - 24px)', // 6.25 cards with gap (w-96 = 384px)
          maxWidth: '100%'
        }}
      >
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'auto', msOverflowStyle: 'auto' }}
        >
          {locations.map((loc) => (
            <Link
              key={loc.id}
              href={`/properties?location=${loc.id}&locationName=${encodeURIComponent(loc.name)}`}
              className="flex flex-col items-start bg-white rounded-xl px-8 py-6 w-96 shadow border border-gray-100 hover:shadow-lg hover:border-blue-400 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {/* First row: Number of properties */}
              <div className="flex items-center gap-2 mb-3 text-gray-700 w-full">
                <Building2 className="h-5 w-5 text-blue-700 flex-shrink-0" />
                <span className="font-semibold text-base text-gray-900 truncate">
                  {loc.property_count} {loc.property_count === 1 ? 'property' : 'properties'}
                </span>
              </div>
              {/* Second row: Location name */}
              <div className="flex items-center gap-2 text-gray-600 w-full">
                <MapPin className="h-5 w-5 text-blue-700 flex-shrink-0" />
                <span className="font-medium text-base truncate">{loc.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* Carousel Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-6">
          <button
            onClick={scrollLeft}
            className={`flex items-center justify-center w-10 h-10 rounded-full shadow border border-gray-200 bg-white hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed ${!showLeft ? 'opacity-50 pointer-events-none' : ''}`}
            aria-label="Scroll left"
            disabled={!showLeft}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToPage(idx)}
                className={`w-3 h-3 rounded-full border border-gray-300 transition-colors ${currentPage === idx ? 'bg-blue-600' : 'bg-gray-200'}`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>
          <button
            onClick={scrollRight}
            className={`flex items-center justify-center w-10 h-10 rounded-full shadow border border-gray-200 bg-white hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed ${!showRight ? 'opacity-50 pointer-events-none' : ''}`}
            aria-label="Scroll right"
            disabled={!showRight}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      )}
    </div>
  )
} 