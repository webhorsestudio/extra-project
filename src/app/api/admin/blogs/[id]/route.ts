import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseAdminClient()
    
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        category:blog_categories(name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching blog:', error)
      return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 })
    }

    return NextResponse.json({ blog: data })
  } catch (error) {
    console.error('Error in blog API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseAdminClient()
    const updateData = await req.json()

    const { data, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating blog:', error)
      return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 })
    }

    return NextResponse.json({ blog: data })
  } catch (error) {
    console.error('Error in blog update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseAdminClient()
    
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting blog:', error)
      return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in blog delete API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 