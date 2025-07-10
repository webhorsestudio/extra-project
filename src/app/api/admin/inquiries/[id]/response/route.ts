import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { response_notes, response_method } = await request.json()

    console.log('Updating inquiry response:', { id, response_notes, response_method })

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
    
    const updateData: { response_notes?: string; response_method?: string; responded_at?: string } = {}
    
    if (response_notes !== undefined) {
      updateData.response_notes = response_notes
    }
    
    if (response_method !== undefined) {
      updateData.response_method = response_method
    }

    // If response_notes is being set and it wasn't set before, set responded_at
    if (response_notes && response_notes.trim()) {
      updateData.responded_at = new Date().toISOString()
    }

    const { data, error } = await adminSupabase
      .from('inquiries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating inquiry response:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Inquiry response updated successfully:', data)

    return NextResponse.json({ 
      success: true, 
      inquiry: data 
    })

  } catch (error) {
    console.error('Error in inquiry response API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 