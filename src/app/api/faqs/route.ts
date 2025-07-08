import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    console.log('Public FAQs API: Starting request')
    
    const supabase = createSupabaseClient()
    console.log('Public FAQs API: Supabase client created')
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('Public FAQs API: Query params:', { search, category, limit, offset })

    // Build the query - only published FAQs
    let query = supabase
      .from('faqs')
      .select(`
        *,
        category:faq_categories(name, slug)
      `)
      .eq('is_published', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply search filter
    if (search) {
      query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%`)
    }

    // Apply category filter
    if (category !== 'all') {
      query = query.eq('category_slug', category)
    }

    console.log('Public FAQs API: Executing query...')
    const { data: faqs, error } = await query

    if (error) {
      console.error('Public FAQs API: Error fetching FAQs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Public FAQs API: Found FAQs:', faqs?.length || 0)

    // Transform the data to include category info
    const transformedFAQs = faqs?.map(faq => ({
      ...faq,
      category_name: faq.category?.name || 'General'
    })) || []

    return NextResponse.json({ 
      faqs: transformedFAQs,
      total: transformedFAQs.length,
      limit,
      offset
    })

  } catch (error) {
    console.error('Public FAQs API: Error in FAQs API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 