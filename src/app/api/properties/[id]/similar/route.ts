import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { similarPropertiesService } from '@/lib/services/similar-properties-service';
import { userPreferenceService } from '@/lib/personalization/user-preferences';
import type { Property } from '@/types/property';

function getAmenityName(pa: unknown): string | undefined {
  if (
    pa &&
    typeof pa === 'object' &&
    pa !== null &&
    'amenity' in pa &&
    pa.amenity &&
    typeof pa.amenity === 'object' &&
    pa.amenity !== null &&
    'name' in pa.amenity &&
    typeof (pa.amenity as Record<string, unknown>).name === 'string'
  ) {
    return (pa.amenity as { name: string }).name;
  }
  return undefined;
}

function getCategoryName(pc: unknown): string | undefined {
  if (
    pc &&
    typeof pc === 'object' &&
    pc !== null &&
    'category' in pc &&
    pc.category &&
    typeof pc.category === 'object' &&
    pc.category !== null &&
    'name' in pc.category &&
    typeof (pc.category as Record<string, unknown>).name === 'string'
  ) {
    return (pc.category as { name: string }).name;
  }
  return undefined;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const userId = searchParams.get('userId') || undefined;
    const { id } = await params;

    // Get property by ID
    const supabase = await createSupabaseServerClient();
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        property_type,
        property_collection,
        location_id,
        location,
        latitude,
        longitude,
        created_at,
        updated_at,
        created_by,
        posted_by,
        developer_id,
        parking,
        parking_spots,
        rera_number,
        slug,
        property_images (
          id,
          image_url
        ),
        property_configurations (
          id,
          bhk,
          price,
          area,
          bedrooms,
          bathrooms,
          ready_by
        ),
        location_data:property_locations (
          id,
          name
        ),
        developer:property_developers (
          id,
          name,
          website,
          address,
          logo_url
        ),
        property_amenities:property_amenity_relations (
          amenity:amenities (
            id,
            name
          )
        ),
        property_categories:property_category_relations (
          category:property_categories (
            id,
            name
          )
        )
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Transform property data to match Property interface
    const transformedProperty = {
      ...property,
      property_images: Array.isArray(property.property_images) 
        ? property.property_images.map((img: { id: string; image_url: string }) => ({
            id: img.id,
            property_id: id,
            image_url: img.image_url,
            created_at: new Date().toISOString()
          }))
        : [],
      property_configurations: Array.isArray(property.property_configurations)
        ? property.property_configurations.map((config: { id: string; bhk: number; price: number; area: number; bedrooms: number; bathrooms: number; ready_by?: string }) => ({
            id: config.id,
            property_id: id,
            bhk: config.bhk,
            price: config.price,
            area: config.area,
            bedrooms: config.bedrooms,
            bathrooms: config.bathrooms,
            ready_by: config.ready_by
          }))
        : [],
      location_data: Array.isArray(property.location_data) 
        ? property.location_data[0] || null 
        : property.location_data || null,
      developer: Array.isArray(property.developer) && property.developer.length > 0
        ? {
            id: property.developer[0].id,
            name: property.developer[0].name,
            website: property.developer[0].website,
            address: property.developer[0].address,
            logo_url: property.developer[0].logo_url,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        : undefined,
      amenities: Array.isArray(property.property_amenities)
        ? property.property_amenities.map(getAmenityName).filter((name): name is string => !!name)
        : [],
      categories: Array.isArray(property.property_categories)
        ? property.property_categories.map(getCategoryName).filter((name): name is string => !!name)
        : [],
    } as unknown as Property;

    // Get enhanced similar properties
    const result = await similarPropertiesService.getSimilarProperties(
      transformedProperty,
      userId,
      limit
    );

    // Update user preferences if user is logged in
    if (userId) {
      userPreferenceService.updatePreferences(userId, transformedProperty);
    }

    return NextResponse.json({
      success: true,
      data: {
        properties: result.properties,
        scores: result.scores,
        personalizedScores: result.personalizedScores,
        metadata: {
          cacheHit: result.cacheHit,
          algorithm: result.algorithm,
          processingTime: result.metadata.processingTime,
          totalCandidates: result.metadata.totalCandidates,
          cacheStats: result.metadata.cacheStats,
        },
      },
    });

  } catch (error) {
    console.error('Error in similar properties API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, interactionType } = await request.json();
    const { id } = await params;

    if (!userId || !interactionType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get property data
    const supabase = await createSupabaseServerClient();
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        property_type,
        property_collection,
        location,
        latitude,
        longitude,
        amenities,
        developer_id,
        developer:property_developers (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Transform property data
    const transformedProperty = {
      ...property,
      developer: Array.isArray(property.developer) && property.developer.length > 0
        ? {
            id: property.developer[0].id,
            name: property.developer[0].name,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        : undefined,
    } as Property;

    // Update user preferences
    userPreferenceService.updatePreferences(userId, transformedProperty);

    return NextResponse.json({
      success: true,
      message: 'User preferences updated successfully',
    });

  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 