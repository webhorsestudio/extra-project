import { checkAdminAuth } from '@/lib/admin-data'
import { createSupabaseAdminUserClient } from '@/lib/supabase/admin'
import CategoryClient from './CategoryClient'

export default async function CategoryPage() {
  try {
    // SSR admin authentication
    console.log('CategoryPage: Starting admin authentication...')
    await checkAdminAuth()
    console.log('CategoryPage: Admin authentication successful')

    const supabase = await createSupabaseAdminUserClient()
    console.log('CategoryPage: Supabase client created')
    
    let categories = []
    try {
      console.log('CategoryPage: Fetching categories from property_categories table...')
      const { data, error } = await supabase
        .from('property_categories')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('CategoryPage: Error fetching categories:', error)
        console.error('CategoryPage: Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
      } else {
              console.log('CategoryPage: Categories fetched successfully:', data?.length || 0, 'categories')

      categories = data || []
      }
    } catch (fetchError) {
      console.error('CategoryPage: Exception while fetching categories:', fetchError)
    }

    console.log('CategoryPage: Rendering CategoryClient with', categories.length, 'categories')
    return <CategoryClient categories={categories} />
  } catch (error) {
    console.error('CategoryPage: Fatal error:', error)
    // Return a fallback component with empty categories
    return <CategoryClient categories={[]} />
  }
} 
