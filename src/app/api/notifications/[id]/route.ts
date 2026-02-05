import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await request.json()
    
    // Only allow status updates to 'read'
    if (status !== 'read') {
      return NextResponse.json({ error: 'Invalid status update' }, { status: 400 })
    }
    
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
      .from('notifications')
      .update({ status })
      .eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 