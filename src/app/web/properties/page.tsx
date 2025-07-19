import React from 'react';
import { getPropertiesData } from '@/lib/properties-data';
import ServerLayout from '@/components/web/ServerLayout';
import PropertiesGrid from '@/components/web/properties/PropertiesGrid';
import type { Property } from '@/types/property';

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

  // When mapping properties for PropertiesGrid, ensure all required fields are present
  const allowedTypes = ['Apartment', 'House', 'Commercial', 'Land', 'Villa', 'Penthouse'];
  const allowedCollections = ['Newly Launched', 'Featured', 'Ready to Move', 'Under Construction'];

  const mappedProperties: Property[] = (properties || []).map((prop: Record<string, unknown>) => {
    const property_type = (
      typeof prop.property_type === 'string' && allowedTypes.includes(prop.property_type)
        ? prop.property_type
        : 'Apartment'
    ) as Property['property_type'];
    const property_collection = (
      typeof prop.property_collection === 'string' && allowedCollections.includes(prop.property_collection)
        ? prop.property_collection
        : 'Featured'
    ) as Property['property_collection'];
    const property_nature = (
      typeof prop.property_nature === 'string' && ['Sell', 'Rent'].includes(prop.property_nature)
        ? prop.property_nature
        : 'Sell'
    ) as Property['property_nature'];
    const property_configurations = Array.isArray(prop.property_configurations) ? prop.property_configurations : [];
    const property_images = Array.isArray(prop.property_images) ? prop.property_images : [];
    return {
      id: prop.id as string,
      title: prop.title as string,
      description: prop.description as string || '',
      property_type,
      property_nature,
      property_collection,
      location: prop.location as string || '',
      latitude: typeof prop.latitude === 'number' ? prop.latitude : 0,
      longitude: typeof prop.longitude === 'number' ? prop.longitude : 0,
      created_at: prop.created_at as string || '',
      updated_at: (prop.updated_at as string) || (prop.created_at as string) || '',
      created_by: (prop.created_by as string) || '',
      posted_by: (prop.posted_by as string) || '',
      developer_id: typeof prop.developer_id === 'string' ? prop.developer_id : undefined,
      parking: typeof prop.parking === 'boolean' ? prop.parking : false,
      parking_spots: typeof prop.parking_spots === 'number' ? prop.parking_spots : undefined,
      rera_number: typeof prop.rera_number === 'string' ? prop.rera_number : null,
      status: typeof prop.status === 'string' ? prop.status : 'active',
      is_verified: typeof prop.is_verified === 'boolean' ? prop.is_verified : false,
      location_data: Array.isArray(prop.property_locations) ? prop.property_locations[0] : prop.property_locations,
      property_images,
      property_configurations,
      amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
      categories: Array.isArray(prop.categories) ? prop.categories : [],
      property_amenities: [],
      property_categories: [],
      property_views: [],
      property_favorites: [],
      view_count: 0,
      favorite_count: 0,
    };
  });

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
            initialProperties={mappedProperties}
            initialFilters={filters}
          />
        </div>
      </div>
    </ServerLayout>
  );
} 