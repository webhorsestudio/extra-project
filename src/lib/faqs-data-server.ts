import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface FAQData {
  id: string
  question: string
  answer: string
  category_id?: string
  category_slug: string
  category_name: string
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
  created_by?: string
  creator_name?: string
}

export interface FAQCategoryData {
  id: string
  name: string
  slug: string
  description?: string
  faq_count: number
  created_at: string
  updated_at: string
}

export async function getFAQsData(category?: string): Promise<FAQData[]> {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Add caching for better performance
    const cacheOptions = {
      next: { revalidate: 300 } // Cache for 5 minutes
    }
    
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

    // Apply category filter if specified
    if (category && category !== 'all') {
      query = query.eq('category_slug', category)
    }

    const { data: faqs, error } = await query
    
    if (error) {
      console.error('Error fetching FAQs data:', error)
      return []
    }

    // Transform the data to include category info
    const transformedFAQs = faqs?.map(faq => ({
      ...faq,
      category_name: faq.category?.name || 'General'
    })) || []

    return transformedFAQs
  } catch (error) {
    console.error('Error fetching FAQs data:', error)
    return []
  }
}

export async function getFAQCategoriesData(): Promise<FAQCategoryData[]> {
  try {
    const supabase = await createSupabaseServerClient()
    
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
      console.error('Error fetching FAQ categories data:', error)
      return []
    }

    // Transform the data to include FAQ count
    const transformedCategories = categories?.map(category => ({
      ...category,
      faq_count: category.faqs?.[0]?.count || 0
    })).filter(category => category.faq_count > 0) || []

    return transformedCategories
  } catch (error) {
    console.error('Error fetching FAQ categories data:', error)
    return []
  }
} 