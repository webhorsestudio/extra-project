'use client'

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCardV2 from './PropertyCardV2';
import type { Property } from '@/types/property';

interface PropertyCarouselProps {
  properties: Property[];
  title?: string;
  titleAlign?: 'right' | 'none' | 'left';
}

export default function PropertyCarousel({ properties, title, titleAlign = 'none' }: PropertyCarouselProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive cards per page
  useEffect(() => {
    function updateCardsPerPage() {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      if (width < 600) setCardsPerPage(1);
      else if (width < 900) setCardsPerPage(2);
      else setCardsPerPage(3);
    }
    updateCardsPerPage();
    window.addEventListener('resize', updateCardsPerPage);
    return () => window.removeEventListener('resize', updateCardsPerPage);
  }, []);

  const totalPages = Math.ceil(properties.length / cardsPerPage);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check scroll position to show/hide arrows and update current page
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
      setCurrentPage(Math.round(scrollLeft / clientWidth));
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      scrollContainerRef.current.scrollBy({ left: -clientWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      scrollContainerRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
    }
  };

  // Scroll to a specific page (dot click)
  const scrollToPage = (pageIdx: number) => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({ left: pageIdx * clientWidth, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isHydrated) {
      checkScrollPosition();
      const handleResize = () => {
        setTimeout(checkScrollPosition, 100);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [properties, isHydrated, cardsPerPage]);

  useEffect(() => {
    if (isHydrated) {
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        const handleScroll = () => {
          checkScrollPosition();
        };
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
      }
    }
  }, [isHydrated]);

  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <section className="py-4 sm:py-6 lg:py-8">
      <div ref={containerRef} className="container mx-auto px-4 sm:px-6 lg:px-8">
        {title && titleAlign === 'right' && (
          <div className="flex justify-end mb-6">
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
        )}
        {title && titleAlign === 'left' && (
          <div className="flex justify-start mb-6">
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
        )}
        <div className="relative">
          {/* Properties Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'auto', msOverflowStyle: 'auto' }}
          >
            {properties.map((property) => (
              <div key={property.id} className="flex-shrink-0 w-[75vw] max-w-xs sm:w-80">
                <PropertyCardV2 property={property} />
              </div>
            ))}
          </div>

          {/* Carousel Controls at Bottom */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              className={`flex items-center justify-center w-10 h-10 rounded-full shadow border border-gray-200 bg-white hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed ${!showLeftArrow ? 'opacity-50 pointer-events-none' : ''}`}
              aria-label="Scroll left"
              disabled={!showLeftArrow}
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>

            {/* Carousel Indicators */}
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

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              className={`flex items-center justify-center w-10 h-10 rounded-full shadow border border-gray-200 bg-white hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed ${!showRightArrow ? 'opacity-50 pointer-events-none' : ''}`}
              aria-label="Scroll right"
              disabled={!showRightArrow}
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 