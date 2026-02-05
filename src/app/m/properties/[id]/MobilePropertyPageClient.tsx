'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';
import { useRouter } from 'next/navigation';
import MobilePropertyHeroGallery from '@/components/mobile/property/MobilePropertyHeroGallery';
import MobilePropertyInfoCard from '@/components/mobile/property/MobilePropertyInfoCard';
import MobilePropertyDescription from '@/components/mobile/property/MobilePropertyDescription';
import MobilePropertyConfigurations from '@/components/mobile/property/MobilePropertyConfigurations';
import MobilePropertyFeatures from '@/components/mobile/property/MobilePropertyFeatures';
import MobilePropertyLocationMap from '@/components/mobile/property/MobilePropertyLocationMap';
import MobilePropertyVideo from '@/components/mobile/property/MobilePropertyVideo';

import MobileListingBySection from '@/components/mobile/property/MobileListingBySection';
import MobileSimilarProperties from '@/components/mobile/property/MobileSimilarProperties';
import MobileEnquiryModal from '@/components/mobile/property/MobileEnquiryModal';

interface MobilePropertyPageClientProps {
  property: Property;
  similarProperties: Property[];
}

export default function MobilePropertyPageClient({ 
  property, 
  similarProperties 
}: MobilePropertyPageClientProps) {
  const router = useRouter();
  const [enquiryModalOpen, setEnquiryModalOpen] = useState<'contact' | 'tour' | null>(null);

  // Memoize the property object to prevent unnecessary re-renders
  const memoizedProperty = React.useMemo(() => property, [property]);

  const handleBack = () => {
    router.push('/m/properties');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero Section with Gallery and Info Card */}
      <div className="relative">
        <MobilePropertyHeroGallery property={memoizedProperty} onBack={handleBack} />
        <div className="relative -mt-8 z-10">
          <MobilePropertyInfoCard 
            property={memoizedProperty} 
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-2">
        {/* Key Highlights */}
        {memoizedProperty.description && (
          <section id="key-highlights" className="mb-1">
            <MobilePropertyDescription property={memoizedProperty} />
          </section>
        )}

        {/* Listed By Section */}
        <section id="listed-by" className="mb-1">
          <MobileListingBySection property={memoizedProperty} />
        </section>

        {/* Available Configurations */}
        <section id="configurations" className="mb-1">
          <MobilePropertyConfigurations property={memoizedProperty} />
        </section>

        {/* Location Map */}
        {(memoizedProperty.latitude && memoizedProperty.longitude) ? (
          <section id="location" className="mb-1">
            <MobilePropertyLocationMap property={memoizedProperty} />
          </section>
        ) : memoizedProperty.location_data?.name ? (
          <section id="location" className="mb-1">
            <MobilePropertyLocationMap property={memoizedProperty} locationName={memoizedProperty.location_data.name} />
          </section>
        ) : null}

        {/* Property Video Section */}
        <MobilePropertyVideo videoUrl={memoizedProperty.video_url} />

        {/* Property Features */}
        <section id="features" className="mb-1">
          <MobilePropertyFeatures property={memoizedProperty} />
        </section>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <section id="similar-projects" className="mb-1">
            <MobileSimilarProperties properties={similarProperties} />
          </section>
        )}

      </div>
      <MobileEnquiryModal
        key={`${memoizedProperty.id}-${enquiryModalOpen}`}
        open={enquiryModalOpen !== null}
        type={enquiryModalOpen || 'contact'}
        property={memoizedProperty}
        onClose={() => setEnquiryModalOpen(null)}
      />
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 flex gap-2 px-4 py-3 shadow-lg">
        <button
          className={`flex-1 py-3 rounded-xl font-semibold text-base transition-colors bg-[#0A1736] text-white shadow-md`}
          onClick={() => setEnquiryModalOpen('contact')}
        >
          Contact Now
        </button>
        <button
          className={`flex-1 py-3 rounded-xl font-semibold text-base transition-colors bg-gray-100 text-[#0A1736] shadow-md`}
          onClick={() => setEnquiryModalOpen('tour')}
        >
          Request a tour
        </button>
      </div>
    </div>
  );
} 