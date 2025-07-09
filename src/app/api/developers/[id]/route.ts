import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseAdminClient()
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('property_developers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    return NextResponse.json({ developer: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseAdminClient()
  try {
    const { 
      name, 
      website, 
      address, 
      logo_url, 
      logo_storage_path, 
      contact_info, 
      is_active 
    } = await request.json()

    const { id } = await params

    console.log('PUT /api/developers/[id]:', {
      id,
      name,
      logo_url,
      logo_storage_path,
      hasContactInfo: !!contact_info
    })

    if (!name) {
      return NextResponse.json({ error: 'Developer name is required' }, { status: 400 })
    }

    const updateData = { 
      name, 
      website, 
      address, 
      logo_url, 
      logo_storage_path, 
      contact_info, 
      is_active,
      updated_at: new Date().toISOString()
    }

    console.log('Updating developer with data:', updateData)

    const { data, error } = await supabase
      .from('property_developers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    console.log('Developer updated successfully:', data)
    return NextResponse.json({ developer: data })
  } catch (error) {
    console.error('PUT /api/developers/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseAdminClient()
  try {
    const { id } = await params
    // First, get the developer to check if it has a logo to delete
    const { data: developer, error: fetchError } = await supabase
      .from('property_developers')
      .select('logo_storage_path')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    // Delete the developer from database
    const { error: deleteError } = await supabase
      .from('property_developers')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // If there was a logo, delete it from storage
    if (developer.logo_storage_path) {
      try {
        await supabase.storage
          .from('developer-logos')
          .remove([developer.logo_storage_path])
      } catch (storageError) {
        console.error('Error deleting logo from storage:', storageError)
        // Don't fail the request if logo deletion fails
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 