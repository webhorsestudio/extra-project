import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseAdminClient()
  try {
    const { id } = await params
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, image_url, image_storage_path, is_active } = body

    // Check if this is a status-only update or full update
    const isStatusOnlyUpdate = Object.keys(body).length === 1 && 'is_active' in body

    if (isStatusOnlyUpdate) {
      if (typeof is_active !== 'boolean') {
        return NextResponse.json(
          { error: 'is_active field must be a boolean' },
          { status: 400 }
        )
      }
      const { data, error } = await supabase
        .from('property_locations')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single()
      if (error) {
        return NextResponse.json(
          { error: `Database error: ${error.message}` },
          { status: 500 }
        )
      }
      return NextResponse.json({ success: true, location: data })
    } else {
      if (!name || typeof name !== 'string') {
        return NextResponse.json(
          { error: 'name field is required and must be a string' },
          { status: 400 }
        )
      }
      if (is_active !== undefined && typeof is_active !== 'boolean') {
        return NextResponse.json(
          { error: 'is_active field must be a boolean' },
          { status: 400 }
        )
      }
      const updateData: Record<string, unknown> = {
        name: name.trim(),
        description: description?.trim() || null,
        image_url: image_url || null,
        image_storage_path: image_storage_path || null,
      }
      if (is_active !== undefined) {
        updateData.is_active = is_active
      }
      const { data, error } = await supabase
        .from('property_locations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      if (error) {
        return NextResponse.json(
          { error: `Database error: ${error.message}` },
          { status: 500 }
        )
      }
      return NextResponse.json({ success: true, location: data })
    }
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseAdminClient()
  try {
    const { id } = await params
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    // Delete the location from database
    const { error: deleteError } = await supabase
      .from('property_locations')
      .delete()
      .eq('id', id)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 