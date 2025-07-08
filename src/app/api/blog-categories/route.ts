import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET() {
  try {
    const supabase = await createSupabaseApiClient()
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching blog categories:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ categories: data || [] })
  } catch (error) {
    console.error('Error in blog categories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseApiClient()
    const { name, slug, description } = await req.json()
    
    if (!name || !slug) {
      return NextResponse.json({ 
        error: 'Category name and slug are required' 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('blog_categories')
      .insert([{ name, slug, description }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating blog category:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ category: data })
  } catch (error) {
    console.error('Error in blog categories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 