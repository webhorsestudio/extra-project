import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const params = await ctx.params;
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const result = await supabase
      .from('property_favorites')
      .select('id')
      .eq('property_id', params.id)
      .eq('user_id', user.id)
      .single()
    
    if (result.error && result.error.code !== 'PGRST116') { // PGRST116: No rows found
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }
    
    return NextResponse.json({ isFavorited: !!result.data })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const params = await ctx.params;
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
    const insertResult = await supabase
      .from('property_favorites')
      .insert({
        property_id: params.id,
        user_id: user.id
      })
      .select()
      .single()
    
    if (insertResult.error) {
      return NextResponse.json({ error: insertResult.error.message }, { status: 500 })
    }
    
    return NextResponse.json(insertResult.data)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const params = await ctx.params;
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const deleteResult = await supabase
      .from('property_favorites')
      .delete()
      .eq('property_id', params.id)
      .eq('user_id', user.id)
    
    if (deleteResult.error) {
      return NextResponse.json({ error: deleteResult.error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 