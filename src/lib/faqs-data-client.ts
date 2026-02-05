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

export async function getFAQsDataClient(category?: string): Promise<FAQData[]> {
  try {
    const params = new URLSearchParams()
    if (category && category !== 'all') {
      params.append('category', category)
    }

    const response = await fetch(`/api/faqs?${params}`)
    
    if (!response.ok) {
      console.error('Error fetching FAQs data:', response.statusText)
      return []
    }

    const data = await response.json()
    return data.faqs || []
  } catch (error) {
    console.error('Error fetching FAQs data:', error)
    return []
  }
}

export async function getFAQCategoriesDataClient(): Promise<FAQCategoryData[]> {
  try {
    const response = await fetch('/api/faqs/categories')
    
    if (!response.ok) {
      console.error('Error fetching FAQ categories data:', response.statusText)
      return []
    }

    const data = await response.json()
    return data.categories || []
  } catch (error) {
    console.error('Error fetching FAQ categories data:', error)
    return []
  }
} 