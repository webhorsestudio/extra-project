'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/mobile/PropertyCard';
import PropertyCardSkeleton from '@/components/mobile/PropertyCardSkeleton';
import FloatingViewModeButtons from '@/components/mobile/FloatingViewModeButtons';
import MobileMapView from '@/components/mobile/MobileMapView';
import MapViewDrawer from '@/components/mobile/MapViewDrawer';
import { useFooterVisible } from '@/components/mobile/FooterVisibleContext';
import MobileHeader from '@/components/mobile/Header';
import type { Property } from '@/types/property';

const PAGE_SIZE = 10;
const VIEW_MODES = {
  GRID: 'grid',
  MAP: 'map',
} as const;

// type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];

interface ApiResponse {
  properties: Property[];
  count: number;
}

function MobilePropertiesPageContent() {
  const router = useRouter();
  const footerVisible = useFooterVisible();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
  const [mapDrawerOpen, setMapDrawerOpen] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Determine view mode from query param
  const viewMode = searchParams.get('view') === 'map' ? 'map' : 'grid';

  // Fetch properties
  const fetchProperties = useCallback(
    async (pageNum: number): Promise<ApiResponse> => {
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

  // Handle property selection in map view
  const handlePropertySelect = useCallback((property: Property) => {
    // Check if this is a grid view switch request (empty property object)
    if (!property.id) {
      // When switching to map view, update the URL
      const params = new URLSearchParams(searchParams.toString());
      params.set('view', 'map');
      router.replace(`/m/properties?${params.toString()}`);
      return;
    }
    setSelectedPropertyId(property.id);
  }, [searchParams, router]);

  // Handle marker click in map view
  const handleMarkerClick = useCallback((property: Property) => {
    setSelectedPropertyId(property.id);
    setMapDrawerOpen(true);
  }, []);

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
        {properties.map((property: Property) => (
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
    content = (
      <div className="relative w-full h-full">
        <MobileMapView
          properties={properties}
          onMarkerClick={handleMarkerClick}
        />
        <MapViewDrawer
          properties={properties}
          selectedPropertyId={selectedPropertyId}
          onPropertySelect={handlePropertySelect}
          onClose={() => setMapDrawerOpen(false)}
          isOpen={mapDrawerOpen}
        />
      </div>
    );
  }

  // When switching to map view, update the URL
  const handleSwitchToMapView = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', 'map');
    router.replace(`/m/properties?${params.toString()}`);
  };
  // When switching to grid view, update the URL
  const handleSwitchToGridView = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('view');
    router.replace(`/m/properties?${params.toString()}`);
  };

  return (
    <>
      {viewMode === 'map' ? (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-50 bg-white">
          <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <MobileHeader />
            {/* Map container */}
            <div className="flex-1 relative">
              {/* Pass handleSwitchToGridView to MapViewDrawer if needed */}
              <MobileMapView
                properties={properties}
                onMarkerClick={handleMarkerClick}
              />
              <MapViewDrawer
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                onPropertySelect={handlePropertySelect}
                onClose={() => setMapDrawerOpen(false)}
                isOpen={mapDrawerOpen}
                onSwitchToGridView={handleSwitchToGridView}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 px-6 sm:px-10 relative">
          <div className="flex items-center justify-between mt-6">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Properties</h2>
            <span className="text-sm text-gray-500">{properties.length} properties</span>
          </div>
          {content}
          {/* Floating View Mode Buttons (modular, scroll effect) */}
          <FloatingViewModeButtons
            viewMode={viewMode}
            setViewMode={mode => {
              if (mode === 'map') handleSwitchToMapView();
              else handleSwitchToGridView();
            }}
            footerVisible={footerVisible}
          />
        </div>
      )}
    </>
  );
}

export default function MobilePropertiesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 px-6 sm:px-10 relative">
        <div className="flex items-center justify-between mt-6">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Properties</h2>
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    }>
      <MobilePropertiesPageContent />
    </Suspense>
  );
} 