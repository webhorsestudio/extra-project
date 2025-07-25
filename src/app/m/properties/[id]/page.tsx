import React from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import MobilePropertyPageClient from './MobilePropertyPageClient';
import { SimilarPropertiesService } from '@/lib/services/similar-properties-service';
import Link from 'next/link';

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

interface AmenityRelation {
  property_amenities?: {
    name: string;
    image_url?: string;
  };
}

interface CategoryRelation {
  property_categories?: {
    name: string;
    icon?: string;
  };
}

export default async function MobilePropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  
  // Fetch property data by id - use the correct foreign key relationships
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images(*),
      property_configurations(*),
      location_data:property_locations!location_id(*),
      developer:property_developers!developer_id(*),
      property_amenity_relations(
        amenity_id,
        property_amenities(*)
      ),
      property_category_relations(
        category_id,
        property_categories(*)
      )
    `)
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Property Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The property you&apos;re looking for doesn&apos;t exist or is no longer available.
            </p>
            <div className="mt-6">
              <Link 
                href="/m/properties"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Map relations to objects for Features component (amenities and categories)
  type Amenity = { name: string; image_url?: string };
  type Category = { name: string; icon?: string };
  if (property) {
    property.amenities = property.property_amenity_relations?.map((rel: AmenityRelation) =>
      rel.property_amenities?.name && {
        name: rel.property_amenities.name,
        image_url: rel.property_amenities.image_url || '',
      }
    ).filter((a: Amenity | false | undefined): a is Amenity => !!a && !!a.name) || [];
    property.categories = property.property_category_relations?.map((rel: CategoryRelation) =>
      rel.property_categories?.name && {
        name: rel.property_categories.name,
        icon: rel.property_categories.icon || 'Home',
      }
    ).filter((c: Category | false | undefined): c is Category => !!c && !!c.name) || [];
  }

  // Fetch similar properties
  const similarPropertiesService = new SimilarPropertiesService();
  const similarPropertiesResult = await similarPropertiesService.getSimilarProperties(property, undefined, 4);

  return (
    <MobilePropertyPageClient 
      property={property} 
      similarProperties={similarPropertiesResult.properties}
    />
  );
} 