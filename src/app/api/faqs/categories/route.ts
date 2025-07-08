import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    console.log('Public FAQ Categories API: Starting request')
    
    const supabase = createSupabaseClient()
    console.log('Public FAQ Categories API: Supabase client created')

    // Get categories with published FAQ count
    const { data: categories, error } = await supabase
      .from('faq_categories')
      .select(`
        *,
        faqs:faqs!inner(count)
      `)
      .eq('faqs.is_published', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Public FAQ Categories API: Error fetching categories:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Public FAQ Categories API: Found categories:', categories?.length || 0)

    // Transform the data to include FAQ count
    const transformedCategories = categories?.map(category => ({
      ...category,
      faq_count: category.faqs?.[0]?.count || 0
    })).filter(category => category.faq_count > 0) || []

    return NextResponse.json({ 
      categories: transformedCategories,
      total: transformedCategories.length
    })

  } catch (error) {
    console.error('Public FAQ Categories API: Error in categories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 