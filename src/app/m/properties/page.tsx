'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/mobile/PropertyCard';
import PropertyCardSkeleton from '@/components/mobile/PropertyCardSkeleton';
import { MapPin, LayoutGrid } from 'lucide-react';
import FloatingViewModeButtons from '@/components/mobile/FloatingViewModeButtons';
import { useFooterVisible } from '@/components/mobile/FooterVisibleContext';
// import MapViewDrawer from '@/components/mobile/MapViewDrawer';
import MobileHeader from '@/components/mobile/Header';

const PAGE_SIZE = 10;
const VIEW_MODES = {
  GRID: 'grid',
  MAP: 'map',
} as const;

type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];

function FloatingButton({ icon: Icon, active, onClick, label }: { icon: any; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`mb-3 w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-all border-2
        ${active ? 'bg-[#11182B] border-blue-500' : 'bg-[#11182B] border-transparent'}
        hover:scale-105 active:scale-95 focus:outline-none`}
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
    >
      <Icon className="w-7 h-7 text-white" />
    </button>
  );
}

function MapViewPlaceholder() {
  return (
    <div className="flex items-center justify-center h-80 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl mt-6">
      <span className="text-blue-900 font-semibold text-lg">[Map View Placeholder]</span>
    </div>
  );
}

export default function MobilePropertiesPage() {
  const footerVisible = useFooterVisible();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.GRID);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Fetch properties
  const fetchProperties = useCallback(
    async (pageNum: number) => {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: ((pageNum - 1) * PAGE_SIZE).toString(),
      });
      // Add filters from URL
      const location = searchParams.get('location');
      const category = searchParams.get('category');
      const bedrooms = searchParams.get('bedrooms');
      const min_price = searchParams.get('min_price');
      const max_price = searchParams.get('max_price');
      if (location) params.append('location', location);
      if (category) params.append('category', category);
      if (bedrooms && bedrooms !== 'Any') {
        // API expects 'bhk' param
        params.append('bhk', bedrooms === '5+' ? '5' : bedrooms);
      }
      if (min_price) params.append('min_price', min_price);
      if (max_price) params.append('max_price', max_price);
      const res = await fetch(`/api/mobile/properties?${params.toString()}`);
      if (!res.ok) return { properties: [], count: 0 };
      return await res.json();
    },
    [searchParams]
  );

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchProperties(1).then(data => {
      setProperties(data.properties || []);
      setHasMore((data.properties?.length || 0) === PAGE_SIZE);
      setLoading(false);
    });
  }, [fetchProperties]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const observer = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setLoadingMore(true);
        fetchProperties(page + 1).then(data => {
          setProperties(prev => [...prev, ...(data.properties || [])]);
          setHasMore((data.properties?.length || 0) === PAGE_SIZE);
          setPage(p => p + 1);
          setLoadingMore(false);
        });
      }
    }, { threshold: 1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, fetchProperties]);

  // Only properties with valid coordinates for map view
  const mapProperties = properties.filter(
    (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number' && !isNaN(p.latitude) && !isNaN(p.longitude)
  );

  // Render view based on viewMode
  let content;
  if (viewMode === VIEW_MODES.GRID) {
    content = loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    ) : properties.length === 0 ? (
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg font-medium mb-2">No properties found</p>
        <p className="text-sm">Try adjusting your search criteria</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map((property: any) => (
          <PropertyCard 
            key={property.id} 
            property={property}
            initialIsFavorited={false}
          />
        ))}
        {/* Infinite scroll loader */}
        {hasMore && (
          <div ref={loaderRef} className="col-span-full flex justify-center py-6">
            <PropertyCardSkeleton />
          </div>
        )}
      </div>
    );
  } else if (viewMode === VIEW_MODES.MAP) {
    content = <MapViewPlaceholder />;
  }

  return (
    <div className="space-y-6 px-6 sm:px-10 relative">
      {viewMode === VIEW_MODES.MAP ? (
        <>
          {/* Header always visible in Map View */}
          <MobileHeader />
          {/* Full-page map */}
          {/* <PropertyMap properties={mapProperties} /> */}
          {/* Closed drawer at bottom */}
          {/* <MapViewDrawer count={mapProperties.length} onClick={() => setViewMode(VIEW_MODES.GRID)} /> */}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mt-6">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Properties</h2>
            <span className="text-sm text-gray-500">{properties.length} properties</span>
          </div>
          {content}
          {/* Floating View Mode Buttons (modular, scroll effect) */}
          <FloatingViewModeButtons
            viewMode={viewMode}
            setViewMode={setViewMode}
            footerVisible={footerVisible}
          />
        </>
      )}
    </div>
  );
} 