import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(
  request: NextRequest,
  ctx: { params: { id: string } }
) {
  // @ts-expect-error Next.js dynamic route params can be a Promise in some environments
  const params = typeof ctx.params.then === 'function' ? await ctx.params : ctx.params;
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data, error } = await supabase
      .from('property_favorites')
      .select('id')
      .eq('property_id', params.id)
      .eq('user_id', user.id)
      .single()
    if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ isFavorited: !!data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  ctx: { params: { id: string } }
) {
  // @ts-expect-error Next.js dynamic route params can be a Promise in some environments
  const params = typeof ctx.params.then === 'function' ? await ctx.params : ctx.params;
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: existing } = await supabase
      .from('property_favorites')
      .select('id')
      .eq('property_id', params.id)
      .eq('user_id', user.id)
      .single()
    if (existing) {
      return NextResponse.json({ error: 'Property already favorited' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('property_favorites')
      .insert({
        property_id: params.id,
        user_id: user.id
      })
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: { id: string } }
) {
  // @ts-expect-error Next.js dynamic route params can be a Promise in some environments
  const params = typeof ctx.params.then === 'function' ? await ctx.params : ctx.params;
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { error } = await supabase
      .from('property_favorites')
      .delete()
      .eq('property_id', params.id)
      .eq('user_id', user.id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 