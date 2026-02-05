import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin FAQs API: Starting request')
    
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
    
    const adminSupabase = await createSupabaseAdminClient()
    console.log('Admin FAQs API: Supabase client created')
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const status = searchParams.get('status') || 'all'

    console.log('Admin FAQs API: Query params:', { search, category, status })

    // Build the query
    let query = adminSupabase
      .from('faqs')
      .select(`
        *,
        category:faq_categories(name, slug)
      `)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%`)
    }

    // Apply category filter
    if (category !== 'all') {
      query = query.eq('category_slug', category)
    }

    // Apply status filter
    if (status !== 'all') {
      const isPublished = status === 'published'
      query = query.eq('is_published', isPublished)
    }

    console.log('Admin FAQs API: Executing query...')
    const { data: faqs, error } = await query

    if (error) {
      console.error('Admin FAQs API: Error fetching FAQs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Admin FAQs API: Found FAQs:', faqs?.length || 0)

    // Get creator information separately
    const creatorIds = faqs?.map(f => f.created_by).filter(Boolean) || []
    let creators: Array<{ id: string; full_name: string }> = []
    
    if (creatorIds.length > 0) {
      const { data: profiles } = await adminSupabase
        .from('profiles')
        .select('id, full_name')
        .in('id', creatorIds)
      
      creators = profiles || []
    }

    // Transform the data to include creator name and category info
    const transformedFAQs = faqs?.map(faq => {
      const creator = creators.find(c => c.id === faq.created_by)
      return {
        ...faq,
        creator_name: creator?.full_name || 'Admin',
        category_name: faq.category?.name || 'General'
      }
    }) || []

    return NextResponse.json({ 
      faqs: transformedFAQs,
      total: transformedFAQs.length
    })

  } catch (error) {
    console.error('Admin FAQs API: Error in FAQs API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Admin FAQs API: Creating new FAQ')
    
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
    
    const adminSupabase = await createSupabaseAdminClient()
    const body = await request.json()
    
    const { question, answer, category, order, is_published } = body

    // Validate required fields
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    // Get category information
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

    // Create the FAQ
    const { data: faq, error } = await adminSupabase
      .from('faqs')
      .insert({
        question: question.trim(),
        answer: answer.trim(),
        category_id: categoryId,
        category_slug: categorySlug,
        order_index: order || 1,
        is_published: is_published || false,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Admin FAQs API: Error creating FAQ:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Admin FAQs API: FAQ created successfully')

    return NextResponse.json({ 
      faq,
      message: 'FAQ created successfully'
    })

  } catch (error) {
    console.error('Admin FAQs API: Error in POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 