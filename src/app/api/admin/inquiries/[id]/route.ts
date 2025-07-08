import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminSupabase = await createSupabaseAdminClient()
    const body = await request.json()

    // Validate the inquiry ID
    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {}
    
    // Handle status updates
    if (body.status) {
      updateData.status = body.status
    }
    
    // Handle priority updates
    if (body.priority) {
      updateData.priority = body.priority
    }
    
    // Handle tour status updates
    if (body.tour_status) {
      updateData.tour_status = body.tour_status
    }
    
    // Handle response notes
    if (body.response_notes) {
      updateData.response_notes = body.response_notes
    }
    
    // Handle response method
    if (body.response_method) {
      updateData.response_method = body.response_method
    }
    
    // Handle assigned_to
    if (body.assigned_to) {
      updateData.assigned_to = body.assigned_to
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Update the inquiry
    const { data: inquiry, error } = await adminSupabase
      .from('inquiries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Admin inquiry update API: Error updating inquiry:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      inquiry,
      message: 'Inquiry updated successfully'
    })

  } catch (error) {
    console.error('Admin inquiry update API: Error in inquiry update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminSupabase = await createSupabaseAdminClient()
    
    // Validate the inquiry ID
    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 })
    }

    // Get the inquiry
    const { data: inquiry, error } = await adminSupabase
      .from('inquiries')
      .select(`
        *,
        property:properties(id, title, slug)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Admin inquiry get API: Error fetching inquiry:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    return NextResponse.json({ inquiry })

  } catch (error) {
    console.error('Admin inquiry get API: Error in inquiry get API:', error)
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
    const { id } = await params
    console.log('DELETE request for inquiry ID:', id)
    
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.log('User is not admin. Role:', profile?.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('User is admin, proceeding with delete')

    const adminSupabase = await createSupabaseAdminClient()
    
    // Validate the inquiry ID
    if (!id) {
      console.log('No inquiry ID provided')
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 })
    }

    // First, check if the inquiry exists
    const { data: existingInquiry, error: checkError } = await adminSupabase
      .from('inquiries')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existingInquiry) {
      console.log('Inquiry not found or error checking:', checkError)
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    console.log('Inquiry found, proceeding with delete')

    // Delete the inquiry
    const { error } = await adminSupabase
      .from('inquiries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete operation failed:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Inquiry deleted successfully')

    return NextResponse.json({ 
      message: 'Inquiry deleted successfully'
    })

  } catch (error) {
    console.error('DELETE endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 