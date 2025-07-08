import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseApiClient()
    
    const { count, error } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('location_id', params.id)
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching property count:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 