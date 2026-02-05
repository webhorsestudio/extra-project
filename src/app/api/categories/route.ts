import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('property_categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Categories API: Error fetching categories:', error)
      return NextResponse.json({ 
        error: error.message,
        details: 'Failed to fetch property categories'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      categories: data || [],
      total: data?.length || 0
    })

  } catch (error) {
    console.error('Categories API: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: 'An unexpected error occurred while fetching categories'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, icon, is_active } = await req.json()
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: 'Category name is required',
        details: 'Please provide a name for the category'
      }, { status: 400 })
    }
    
    if (!icon) {
      return NextResponse.json({ 
        error: 'Category icon is required',
        details: 'Please select an icon for the category'
      }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('property_categories')
      .insert([{ name, icon, is_active: is_active !== false }])
      .select()
      .single()

    if (error) {
      console.error('Categories API: Error creating category:', error)
      return NextResponse.json({ 
        error: error.message,
        details: 'Failed to create category'
      }, { status: 500 })
    }

    return NextResponse.json({ category: data })

  } catch (error) {
    console.error('Categories API: Unexpected error in POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: 'An unexpected error occurred while creating the category'
    }, { status: 500 })
  }
} 