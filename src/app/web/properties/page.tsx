import React from 'react';
import { getPropertiesData } from '@/lib/properties-data';
import ServerLayout from '@/components/web/ServerLayout';
import PropertiesGrid from '@/components/web/properties/PropertiesGrid';

interface PropertiesPageProps {
  searchParams: Promise<{
    location?: string;
    locationName?: string;
    min_price?: string;
    max_price?: string;
    type?: string;
    bhk?: string;
    category?: string;
  }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams;
  
  // Parse filters from URL parameters
  const filters = {
    location: params.location,
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
    type: params.type,
    bhk: params.bhk ? Number(params.bhk) : undefined,
    category: params.category,
  };

  // Fetch properties with SSR
  const properties = await getPropertiesData(filters);

  return (
    <ServerLayout showCategoryBar={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Properties
              {filters.category && (
                <span className="text-xl font-normal text-gray-600 ml-2">
                  - {filters.category}
                </span>
              )}
            </h1>
            <p className="text-gray-600">
              {properties.length} properties found
              {filters.category && ` in ${filters.category}`}
            </p>
          </div>
          
          <PropertiesGrid 
            initialProperties={properties}
            initialFilters={filters}
          />
        </div>
      </div>
    </ServerLayout>
  );
} 