import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const result = await supabase
      .from('property_reviews')
      .select(`
        id,
        user_id,
        rating,
        review_text,
        created_at,
        updated_at,
        profiles(
          id,
          full_name,
          email,
          role
        )
      `)
      .eq('property_id', id)
      .order('created_at', { ascending: false })
    
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }
    
    return NextResponse.json(result.data)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { rating, review_text } = await request.json()
    const { id } = await params
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }
    const { data: existing } = await supabase
      .from('property_reviews')
      .select('id')
      .eq('property_id', id)
      .eq('user_id', user.id)
      .single()
    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this property' }, { status: 400 })
    }
    const insertResult = await supabase
      .from('property_reviews')
      .insert({
        property_id: id,
        user_id: user.id,
        rating,
        review_text: review_text || null
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { rating, review_text } = await request.json()
    const { id } = await params
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }
    const updateResult = await supabase
      .from('property_reviews')
      .update({
        rating,
        review_text: review_text || null,
        updated_at: new Date().toISOString()
      })
      .eq('property_id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (updateResult.error) {
      return NextResponse.json({ error: updateResult.error.message }, { status: 500 })
    }
    
    return NextResponse.json(updateResult.data)
  } catch {
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
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const deleteResult = await supabase
      .from('property_reviews')
      .delete()
      .eq('property_id', id)
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