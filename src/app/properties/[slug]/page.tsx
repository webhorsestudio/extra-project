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
import { getRelatedProperties } from '@/lib/seo/internal-linking';
import { generatePropertyMetadata, generatePropertyStructuredData, getSEOConfig } from '@/lib/seo';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

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
  params: Promise<{ slug: string }>;
}

// Generate SEO metadata for property page
export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const supabase = await createSupabaseApiClient();
    
    // Fetch property data by slug
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        location,
        property_type,
        latitude,
        longitude,
        property_images(image_url),
        property_configurations(price, bedrooms, bathrooms, area),
        status,
        created_at,
        updated_at
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error || !property) {
      return {
        title: 'Property Not Found',
        description: 'The requested property could not be found.',
      };
    }

    // Get SEO configuration
    const seoConfig = await getSEOConfig();

    // Transform property data for metadata generation
    const propertyData = {
      id: property.id,
      title: property.title,
      description: property.description,
      location: property.location,
      property_type: property.property_type,
      latitude: property.latitude,
      longitude: property.longitude,
      images: property.property_images?.map((img: { image_url: string }) => img.image_url) || [],
      // Get price and other details from first configuration
      price: property.property_configurations?.[0]?.price,
      bedrooms: property.property_configurations?.[0]?.bedrooms,
      bathrooms: property.property_configurations?.[0]?.bathrooms,
      area: property.property_configurations?.[0]?.area,
      created_at: property.created_at,
      updated_at: property.updated_at,
    };

    // Generate metadata
    const metadata = generatePropertyMetadata(propertyData, seoConfig);

    // Add structured data
    const structuredData = generatePropertyStructuredData(propertyData, seoConfig);
    
    metadata.other = {
      'application/ld+json': JSON.stringify(structuredData)
    };

    return metadata;
  } catch (error) {
    console.error('Error generating property metadata:', error);
    return {
      title: 'Property Details',
      description: 'View detailed information about this property.',
    };
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseApiClient();
  
  // Fetch property data by slug - use the correct foreign key relationships
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
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error || !property) {
    notFound();
  }

  // Map relations to flat arrays for Features component (amenities and categories)
  type Amenity = { name: string; image_url: string };
  type Category = { name: string; icon: string };
  
  const amenities: Amenity[] = property.property_amenity_relations?.map((relation: PropertyAmenityRelation) => ({
    name: relation.property_amenities?.name || '',
    image_url: relation.property_amenities?.image_url || ''
  })) || [];

  const categories: Category[] = property.property_category_relations?.map((relation: PropertyCategoryRelation) => ({
    name: relation.property_categories?.name || '',
    icon: relation.property_categories?.icon || ''
  })) || [];

  // Get similar properties
  const relatedProperties = await getRelatedProperties({
    id: property.id,
    location: property.location,
    property_type: property.property_type,
    price: property.property_configurations?.[0]?.price,
    bedrooms: property.property_configurations?.[0]?.bedrooms
  }, 6);

  // Convert RelatedContent to Property format for the carousel
  const similarProperties = relatedProperties.map(related => ({
    id: related.id,
    title: related.title,
    location: related.location || property.location, // Use related property location or fallback
    property_type: related.property_type as 'House' | 'Apartment' | 'Commercial' | 'Land' | 'Villa' | 'Penthouse' || property.property_type,
    property_images: related.image ? [{ 
      id: related.id + '_img',
      property_id: related.id,
      image_url: related.image,
      display_order: 1,
      created_at: new Date().toISOString()
    }] : [],
    property_configurations: related.property_configurations?.map((config, index) => ({
      id: `${related.id}_config_${index}`,
      property_id: related.id,
      bhk: config.bedrooms || 0,
      price: config.price || 0,
      area: config.area || 0,
      bedrooms: config.bedrooms || 0,
      bathrooms: config.bathrooms || 0,
      floor_plan_url: undefined,
      brochure_url: undefined,
      ready_by: undefined,
    })) || [],
    // Add other required Property fields with defaults
    description: '',
    latitude: 0, // Use 0 instead of null
    longitude: 0, // Use 0 instead of null
    created_by: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    parking: false,
    parking_spots: undefined,
    amenities: [],
    categories: [],
    property_collection: 'Featured' as 'Newly Launched' | 'Featured' | 'Ready to Move' | 'Under Construction',
    posted_by: '',
    rera_number: null,
    location_id: undefined,
    status: 'active' as string,
    is_verified: false,
    verified_at: null,
    verified_by: null,
    developer_id: undefined,
    property_nature: 'Sell' as 'Sell' | 'Rent',
    slug: related.id, // Use ID as slug for now
  }));

  return (
    <ServerLayout showCategoryBar={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <PropertyBreadcrumbs property={property} />
        </div>

        {/* Hero Gallery */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="mb-8 flex flex-col">
            <PropertyHeroGallery property={property} />
            <PropertyInfoCard property={property} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 flex flex-col">
              {/* Key Highlights Section */}
              <section id="key-highlights">
                <PropertyDescription property={property} />
              </section>

              {/* Listing By Section */}
              <ListingBySection property={property} />

              {/* Configurations Section */}
              <section id="configurations">
                <PropertyConfigurations property={property} />
              </section>

              {/* Location Map */}
              <PropertyLocationMap property={property} />

              {/* Features Section */}
              <section id="features">
                <PropertyFeatures 
                  amenities={amenities}
                  categories={categories}
                />
              </section>
            </div>

            {/* Right Column - Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-4">
                <PropertyEnquiryForm property={property} />
              </div>
            </aside>
          </div>

          {/* Similar Properties Section */}
          <section id="similar-projects" className="bg-white rounded-3xl shadow-lg px-8 py-6 mb-8 mt-8 max-w-7xl mx-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-6">Similar Properties</h2>
            <SimilarPropertiesCarousel 
              properties={similarProperties}
              cardsPerPage={3}
            />
          </section>

        </div>
      </div>
    </ServerLayout>
  );
}
