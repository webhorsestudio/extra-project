import { createSupabaseAdminUserClient } from '@/lib/supabase/admin'

export interface CategoryData {
  id: string
  name: string
  icon: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getCategoriesData(): Promise<CategoryData[]> {
  try {
    console.log('Categories Server: Starting data fetch')
    
    const supabase = await createSupabaseAdminUserClient()
    console.log('Categories Server: Supabase client created')

    const { data: categories, error } = await supabase
      .from('property_categories')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Categories Server: Error fetching categories:', error)
      return []
    }

    console.log('Categories Server: Found categories:', categories?.length || 0)

    return categories || []
  } catch (error) {
    console.error('Categories Server: Unexpected error:', error)
    return []
  }
} 