import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { response_notes, response_method } = await request.json()

    console.log('Updating inquiry response:', { id, response_notes, response_method })

    const supabase = await createSupabaseAdminClient()
    
    const updateData: any = {}
    
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

    const { data, error } = await supabase
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