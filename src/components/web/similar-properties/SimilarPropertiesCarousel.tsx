'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCardV2 from '../PropertyCardV2';
import type { Property } from '@/types/property';

interface SimilarPropertiesCarouselProps {
  properties: Property[];
  cardsPerPage: number;
  onPropertyClick?: (property: Property) => void;
}

export default function SimilarPropertiesCarousel({ 
  properties, 
  cardsPerPage,
  onPropertyClick 
}: SimilarPropertiesCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(properties.length / cardsPerPage);
  const startIdx = currentPage * cardsPerPage;
  const endIdx = startIdx + cardsPerPage;
  const visibleProperties = properties.slice(startIdx, endIdx);

  // Touch/swipe support
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  const goPrev = () => goToPage(currentPage - 1);
  const goNext = () => goToPage(currentPage + 1);

  // Reset to first page when properties change
  useEffect(() => {
    setCurrentPage(0);
  }, [properties]);

  // Touch event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const delta = touchStartX.current - touchEndX.current;
      if (Math.abs(delta) > 50) {
        if (delta > 0 && currentPage < totalPages - 1) {
          goNext();
        } else if (delta < 0 && currentPage > 0) {
          goPrev();
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Carousel Controls (desktop only) */}
      <div className="hidden md:block">
        {totalPages > 1 && (
          <>
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              onClick={goPrev}
              disabled={currentPage === 0}
              aria-label="Previous properties"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              onClick={goNext}
              disabled={currentPage === totalPages - 1}
              aria-label="Next properties"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
      {/* Properties Grid (swipeable on mobile) */}
      <div
        className="flex gap-6 overflow-x-auto md:overflow-hidden justify-center w-full px-2 md:px-8 py-2 md:py-0"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {visibleProperties.map((property) => (
          <div
            key={property.id}
            className="min-w-[320px] max-w-xs flex-shrink-0 bg-white rounded-2xl shadow border border-gray-100 overflow-hidden"
          >
            <PropertyCardV2 
              property={property} 
              onUnfavorite={onPropertyClick ? () => onPropertyClick(property) : undefined}
            />
          </div>
        ))}
      </div>
      {/* Pagination Dots (desktop only) */}
      <div className="hidden md:flex justify-center items-center gap-2 mt-8">
        {totalPages > 1 && Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            className={`h-3 w-3 rounded-full transition-all duration-200 ${
              currentPage === idx 
                ? 'bg-[#0A1736] scale-110' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => goToPage(idx)}
            aria-label={`Go to page ${idx + 1}`}
          />
        ))}
      </div>
      {/* Property Count */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Showing {startIdx + 1}-{Math.min(endIdx, properties.length)} of {properties.length} similar properties
        </p>
      </div>
    </div>
  );
} 