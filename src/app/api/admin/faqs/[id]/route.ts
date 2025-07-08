import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Admin FAQs API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin FAQs API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    
    const adminSupabase = await createSupabaseAdminClient()
    
    const { data: faq, error } = await adminSupabase
      .from('faqs')
      .select(`
        *,
        category:faq_categories(name, slug)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Admin FAQs API: Error fetching FAQ:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!faq) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    }

    return NextResponse.json({ faq })
  } catch (error) {
    console.error('Admin FAQs API: Error fetching FAQ:', error)
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
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Admin FAQs API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin FAQs API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    
    const adminSupabase = await createSupabaseAdminClient()
    const body = await request.json()
    
    const { question, answer, category, order, is_published } = body

    // Validate required fields
    if (!question && !answer && category === undefined && order === undefined && is_published === undefined) {
      return NextResponse.json(
        { error: 'At least one field must be provided' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: any = {}
    if (question !== undefined) updateData.question = question.trim()
    if (answer !== undefined) updateData.answer = answer.trim()
    if (order !== undefined) updateData.order_index = order
    if (is_published !== undefined) updateData.is_published = is_published

    // Handle category update
    if (category !== undefined) {
      let categoryId = null
      let categorySlug = 'general'
      
      if (category && category !== 'general') {
        const { data: categoryData } = await adminSupabase
          .from('faq_categories')
          .select('id, slug')
          .eq('slug', category)
          .single()
        
        if (categoryData) {
          categoryId = categoryData.id
          categorySlug = categoryData.slug
        }
      }
      
      updateData.category_id = categoryId
      updateData.category_slug = categorySlug
    }

    const { data: faq, error } = await adminSupabase
      .from('faqs')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:faq_categories(name, slug)
      `)
      .single()

    if (error) {
      console.error('Admin FAQs API: Error updating FAQ:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!faq) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      faq,
      message: 'FAQ updated successfully'
    })
  } catch (error) {
    console.error('Admin FAQs API: Error updating FAQ:', error)
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
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Admin FAQs API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin FAQs API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    
    const adminSupabase = await createSupabaseAdminClient()
    
    const { error } = await adminSupabase
      .from('faqs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Admin FAQs API: Error deleting FAQ:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'FAQ deleted successfully' })
  } catch (error) {
    console.error('Admin FAQs API: Error deleting FAQ:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 