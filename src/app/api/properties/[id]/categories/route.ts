import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data, error } = await supabase
      .from('property_category_relations')
      .select(`
        id,
        category_id,
        created_at,
        property_categories(
          id,
          name,
          icon,
          is_active
        )
      `)
      .eq('property_id', params.id)
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { category_ids } = await request.json()
    if (!category_ids || !Array.isArray(category_ids)) {
      return NextResponse.json(
        { error: 'category_ids array is required' },
        { status: 400 }
      )
    }
    const { error: deleteError } = await supabase
      .from('property_category_relations')
      .delete()
      .eq('property_id', params.id)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    const relations = category_ids.map((category_id: string) => ({
      property_id: params.id,
      category_id
    }))
    const { data, error } = await supabase
      .from('property_category_relations')
      .insert(relations)
      .select()
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