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
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [cardsPerPage, setCardsPerPage] = useState(4)

  useEffect(() => {
    function updateCardsPerPage() {
      if (!scrollRef.current) return
      const width = scrollRef.current.offsetWidth
      if (width < 600) setCardsPerPage(1)
      else if (width < 900) setCardsPerPage(2)
      else if (width < 1200) setCardsPerPage(3)
      else setCardsPerPage(4)
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
    checkScroll()
    const handleScroll = () => checkScroll()
    const ref = scrollRef.current
    if (ref) ref.addEventListener('scroll', handleScroll)
    return () => { if (ref) ref.removeEventListener('scroll', handleScroll) }
  }, [locations, cardsPerPage])

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

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: 'auto', msOverflowStyle: 'auto' }}
      >
        {locations.map((loc) => (
          <Link
            key={loc.id}
                            href={`/properties?location=${loc.id}&locationName=${encodeURIComponent(loc.name)}`}
            className="flex flex-col items-start bg-white rounded-2xl px-7 py-6 min-w-[220px] max-w-[240px] shadow border border-gray-100 hover:shadow-xl hover:border-blue-400 transition-shadow duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center gap-2 mb-1 text-gray-700">
              <Building2 className="h-5 w-5 text-blue-700" />
              <span className="font-semibold text-lg text-gray-900">{loc.property_count} {loc.property_count === 1 ? 'property' : 'properties'}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <MapPin className="h-5 w-5 text-blue-700" />
              <span className="font-medium text-base">{loc.name}</span>
            </div>
          </Link>
        ))}
      </div>
      {/* Carousel Controls */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <button
          onClick={scrollLeft}
          className={`flex items-center justify-center w-9 h-9 rounded-full shadow border border-gray-200 bg-white hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed ${!showLeft ? 'opacity-50 pointer-events-none' : ''}`}
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
          className={`flex items-center justify-center w-9 h-9 rounded-full shadow border border-gray-200 bg-white hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed ${!showRight ? 'opacity-50 pointer-events-none' : ''}`}
          aria-label="Scroll right"
          disabled={!showRight}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  )
} 