import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { UpdateTestimonialInput } from '@/types/testimonial'

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.status !== 200) {
      return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status })
    }

    const payload: UpdateTestimonialInput = await request.json()
    const adminSupabase = await createSupabaseAdminClient()

    const { id } = await params

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (payload.quote !== undefined) updateData.quote = payload.quote
    if (payload.name !== undefined) updateData.name = payload.name
    if (payload.title !== undefined) updateData.title = payload.title
    if (payload.avatar_url !== undefined) updateData.avatar_url = payload.avatar_url
    if (payload.order_index !== undefined) updateData.order_index = payload.order_index
    if (payload.is_active !== undefined) updateData.is_active = payload.is_active

    const { data, error } = await adminSupabase
      .from('home_testimonials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Admin testimonials API: update error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ testimonial: data })
  } catch (error) {
    console.error('Admin testimonials API: unexpected update error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.status !== 200) {
      return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status })
    }

    const { id } = await params
    const adminSupabase = await createSupabaseAdminClient()
    const { error } = await adminSupabase
      .from('home_testimonials')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Admin testimonials API: delete error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin testimonials API: unexpected delete error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


