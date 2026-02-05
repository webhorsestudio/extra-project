import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { CreateTestimonialInput } from '@/types/testimonial'

async function requireAdmin() {
  const supabase = await createSupabaseApiClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { status: 401 as const, message: 'Unauthorized' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { status: 403 as const, message: 'Forbidden' }
  }

  return { status: 200 as const }
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.status !== 200) {
      return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status })
    }

    const adminSupabase = await createSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const includeInactive = searchParams.get('includeInactive') === 'true'

    let query = adminSupabase
      .from('home_testimonials')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true })

    if (search) {
      query = query.or(
        `quote.ilike.%${search}%,name.ilike.%${search}%,title.ilike.%${search}%`
      )
    }

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Admin testimonials API: fetch error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ testimonials: data || [] })
  } catch (error) {
    console.error('Admin testimonials API: unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.status !== 200) {
      return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status })
    }

    const payload: CreateTestimonialInput = await request.json()

    if (!payload.quote || !payload.name || !payload.title) {
      return NextResponse.json(
        { error: 'Quote, name, and title are required' },
        { status: 400 }
      )
    }

    const adminSupabase = await createSupabaseAdminClient()
    const { data, error } = await adminSupabase
      .from('home_testimonials')
      .insert([
        {
          quote: payload.quote,
          name: payload.name,
          title: payload.title,
          avatar_url: payload.avatar_url ?? null,
          order_index: payload.order_index ?? 0,
          is_active: payload.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Admin testimonials API: insert error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ testimonial: data }, { status: 201 })
  } catch (error) {
    console.error('Admin testimonials API: unexpected create error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


