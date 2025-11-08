import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8', 10)

    const query = supabase
      .from('home_testimonials')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(limit)

    const { data, error } = await query

    if (error) {
      console.error('Mobile testimonials API: fetch error', error)
      return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
    }

    return NextResponse.json({ testimonials: data || [] })
  } catch (error) {
    console.error('Mobile testimonials API: unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
