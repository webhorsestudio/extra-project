import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { similarPropertiesService } from '@/lib/services/similar-properties-service';
import { userPreferenceService } from '@/lib/personalization/user-preferences';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const userId = searchParams.get('userId') || undefined;

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
      .eq('id', params.id)
      .eq('status', 'active')
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
      property_images: property.property_images || [],
      property_configurations: property.property_configurations || [],
      location_data: property.location_data || null,
      developer: property.developer || null,
      amenities: property.property_amenities?.map((pa: any) => pa.amenity?.name).filter(Boolean) || [],
      categories: property.property_categories?.map((pc: any) => pc.category?.name).filter(Boolean) || [],
    };

    // Get enhanced similar properties
    const result = await similarPropertiesService.getSimilarProperties(
      transformedProperty,
      userId,
      limit
    );

    // Update user preferences if user is logged in
    if (userId) {
      userPreferenceService.updatePreferences(userId, transformedProperty, 'view');
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
  { params }: { params: { id: string } }
) {
  try {
    const { userId, interactionType } = await request.json();

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
      .eq('id', params.id)
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
      developer: property.developer || null,
    };

    // Update user preferences
    userPreferenceService.updatePreferences(userId, transformedProperty, interactionType);

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