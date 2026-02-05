'use client';
import React, { useState, useEffect } from 'react';
import type { Property } from '@/types/property';
import SimilarPropertiesCarousel from './similar-properties/SimilarPropertiesCarousel';
import SimilarPropertiesHeader from './similar-properties/SimilarPropertiesHeader';
import SimilarPropertiesLoading from './similar-properties/SimilarPropertiesLoading';
import SimilarPropertiesError from './similar-properties/SimilarPropertiesError';
import SimilarPropertiesEmpty from './similar-properties/SimilarPropertiesEmpty';

interface SimilarProjectsSectionProps {
  properties?: Property[];
  currentProperty?: Property;
  loading?: boolean;
  error?: string;
  personalizedCount?: number;
  showPersonalization?: boolean;
  onPropertyClick?: (property: Property) => void;
  onRetry?: () => void;
}

const CARDS_PER_PAGE = 3;

export default function SimilarProjectsSection({ 
  properties = [], 
  loading = false,
  error,
  personalizedCount = 0,
  showPersonalization = false,
  onPropertyClick,
  onRetry
}: SimilarProjectsSectionProps) {
  const [cardsPerPage, setCardsPerPage] = useState(CARDS_PER_PAGE);

  // Responsive: 1 card on mobile, 2 on tablet, 3 on desktop
  const getCardsPerPage = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
    }
    return CARDS_PER_PAGE;
  };

  useEffect(() => {
    const handleResize = () => setCardsPerPage(getCardsPerPage());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="w-full bg-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <SimilarPropertiesHeader />
          <SimilarPropertiesLoading />
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="w-full bg-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <SimilarPropertiesHeader />
          <SimilarPropertiesError error={error} onRetry={onRetry} />
        </div>
      </section>
    );
  }

  // No properties state
  if (!properties || properties.length === 0) {
    return (
      <section className="w-full bg-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <SimilarPropertiesHeader />
          <SimilarPropertiesEmpty />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <SimilarPropertiesHeader 
          showPersonalization={showPersonalization}
          personalizedCount={personalizedCount}
        />
        
        <SimilarPropertiesCarousel 
          properties={properties}
          cardsPerPage={cardsPerPage}
          onPropertyClick={onPropertyClick}
        />
      </div>
    </section>
  );
}
