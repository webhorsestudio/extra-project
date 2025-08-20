import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { UpdatePublicListingData } from '@/types/public-listing'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Admin public listings API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin public listings API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    
    const adminSupabase = await createSupabaseAdminClient()
    
    const { data: listing, error } = await adminSupabase
      .from('public_listings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Admin public listings API: Error fetching listing:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!listing) {
      return NextResponse.json({ error: 'Public listing not found' }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('Admin public listings API: Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Admin public listings API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin public listings API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    
    const adminSupabase = await createSupabaseAdminClient()
    const updateData: UpdatePublicListingData = await request.json()
    
    if (!updateData.title && !updateData.slug && !updateData.content) {
      return NextResponse.json({ 
        error: 'At least one field must be provided for update' 
      }, { status: 400 })
    }

    // Check if slug already exists (if updating slug)
    if (updateData.slug) {
      const { data: existingListing } = await adminSupabase
        .from('public_listings')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', id)
        .single()

      if (existingListing) {
        return NextResponse.json({ 
          error: 'A listing with this slug already exists' 
        }, { status: 400 })
      }
    }

    const { data, error } = await adminSupabase
      .from('public_listings')
      .update({ 
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Admin public listings API: Error updating listing:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Public listing not found' }, { status: 404 })
    }

    return NextResponse.json({ listing: data })
  } catch (error) {
    console.error('Admin public listings API: Error updating listing:', error)
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
  try {
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Admin public listings API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin public listings API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    
    const adminSupabase = await createSupabaseAdminClient()
    
    const { error } = await adminSupabase
      .from('public_listings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Admin public listings API: Error deleting listing:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Public listing deleted successfully' })
  } catch (error) {
    console.error('Admin public listings API: Error deleting listing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
