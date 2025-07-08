import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .update({ name, slug, description })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating blog category:', error)
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseApiClient()
    
    const { error } = await supabase
      .from('blog_categories')
      .delete()
      .eq('id', params.id)
    
    if (error) {
      console.error('Error deleting blog category:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in blog categories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 