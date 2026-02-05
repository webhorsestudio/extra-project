import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseAdminClient()
  try {
    const { data, error } = await supabase
      .from('property_amenities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Amenity not found' }, { status: 404 })
    }

    return NextResponse.json({ amenity: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseAdminClient()
  try {
    const { name, image_url, image_storage_path, is_active } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Amenity name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('property_amenities')
      .update({ 
        name, 
        image_url, 
        image_storage_path, 
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Amenity not found' }, { status: 404 })
    }

    return NextResponse.json({ amenity: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseAdminClient()
  try {
    // First, get the amenity to check if it has an image to delete
    const { data: amenity, error: fetchError } = await supabase
      .from('property_amenities')
      .select('image_storage_path')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!amenity) {
      return NextResponse.json({ error: 'Amenity not found' }, { status: 404 })
    }

    // Delete the amenity from database
    const { error: deleteError } = await supabase
      .from('property_amenities')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // If there was an image, delete it from storage
    if (amenity.image_storage_path) {
      try {
        await supabase.storage
          .from('amenity-images')
          .remove([amenity.image_storage_path])
      } catch (storageError) {
        console.error('Error deleting image from storage:', storageError)
        // Don't fail the request if image deletion fails
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 