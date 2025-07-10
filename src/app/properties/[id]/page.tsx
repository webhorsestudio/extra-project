import React from 'react';
import { createSupabaseApiClient } from '@/lib/supabase/api';
import ServerLayout from '@/components/web/ServerLayout';
import PropertyHeroGallery from '@/components/web/property/PropertyHeroGallery';
import PropertyInfoCard from '@/components/web/property/PropertyInfoCard';
import PropertyFeatures from '@/components/web/property/PropertyFeatures';
import PropertyDescription from '@/components/web/property/PropertyDescription';
import PropertyLocationMap from '@/components/web/property/PropertyLocationMap';
import PropertyEnquiryForm from '@/components/web/property/PropertyEnquiryForm';
import PropertyBreadcrumbs from '@/components/web/property/PropertyBreadcrumbs';
import ListingBySection from '@/components/web/property/ListingBySection';
import PropertyConfigurations from '@/components/web/PropertyConfigurations';
import SimilarPropertiesCarousel from '@/components/web/similar-properties/SimilarPropertiesCarousel';
import { SimilarPropertiesService } from '@/lib/services/similar-properties-service';

interface PropertyAmenityRelation {
  property_amenities?: {
    name?: string;
    image_url?: string;
  };
}

interface PropertyCategoryRelation {
  property_categories?: {
    name?: string;
    icon?: string;
  };
}

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseApiClient();
  
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
      <ServerLayout showCategoryBar={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Property Not Found
              </h1>
              <p className="text-gray-600">We&apos;re sorry, but we couldn&apos;t find the property you&apos;re looking for.</p>
              <div className="mt-6">
                <a 
                  href="/web/properties"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Properties
                </a>
              </div>
            </div>
          </div>
        </div>
      </ServerLayout>
    );
  }

  // Map relations to flat arrays for Features component (amenities and categories)
  type Amenity = { name: string; image_url: string };
  type Category = { name: string; icon: string };
  if (property) {
    property.amenities = property.property_amenity_relations?.map((rel: PropertyAmenityRelation) =>
      rel.property_amenities?.name && {
        name: rel.property_amenities.name,
        image_url: rel.property_amenities.image_url || '',
      }
    ).filter((a: Amenity | false | undefined): a is Amenity => !!a && !!a.name) || [];
    property.categories = property.property_category_relations?.map((rel: PropertyCategoryRelation) =>
      rel.property_categories?.name && {
        name: rel.property_categories.name,
        icon: rel.property_categories.icon || 'Home',
      }
    ).filter((c: Category | false | undefined): c is Category => !!c && !!c.name) || [];
  }

  // Fetch similar properties
  const similarPropertiesService = new SimilarPropertiesService();
  const similarPropertiesResult = await similarPropertiesService.getSimilarProperties(property, undefined, 6);

  return (
    <ServerLayout showCategoryBar={false}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <PropertyBreadcrumbs property={property} />
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-12">
          {/* Full width PropertyHeroGallery and PropertyInfoCard (no extra box) */}
          <div className="mb-8 flex flex-col">
            <PropertyHeroGallery property={property} />
            <PropertyInfoCard property={property} />
          </div>
          {/* Two-column grid starts from PropertyDescription downward */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 flex flex-col">
              {property.description && (
                <section id="key-highlights">
                  <PropertyDescription property={property} />
                </section>
              )}
              <ListingBySection property={property} />
              <section id="configurations">
                <PropertyConfigurations property={property} />
              </section>
              {(property.latitude && property.longitude) ? (
                <PropertyLocationMap property={property} />
              ) : property.location_data?.name ? (
                <PropertyLocationMap property={property} locationName={property.location_data.name} />
              ) : null}
              <section id="features">
                <PropertyFeatures amenities={property.amenities} categories={property.categories} />
              </section>
            </div>
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-4">
                <PropertyEnquiryForm property={property} />
              </div>
            </aside>
          </div>
          {/* Similar Properties Section - full width boxed style */}
          {similarPropertiesResult.properties.length > 0 && (
            <section id="similar-projects" className="bg-white rounded-3xl shadow-lg px-8 py-6 mb-8 mt-8 max-w-7xl mx-auto">
              <h2 className="text-lg md:text-xl font-semibold mb-6">Similar Properties</h2>
              <SimilarPropertiesCarousel 
                properties={similarPropertiesResult.properties}
                cardsPerPage={3}
              />
            </section>
          )}
        </div>
      </div>
    </ServerLayout>
  );
} 