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
  };

  // Fetch properties with SSR
  const properties = await getPropertiesData(filters);

  return (
    <ServerLayout showCategoryBar={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-8 md:px-12 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Properties
            </h1>
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