'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { CategoryForm } from '@/components/admin/blogs/CategoryForm'

interface Category {
  id: string
  name: string
  description?: string
  slug: string
  created_at: string
  updated_at: string
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_categories')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Error fetching category:', error)
          throw error
        }
        if (!data) {
          router.push('/admin/blogs/categories')
          return
        }

        setCategory(data)
      } catch (error) {
        console.error('Error fetching category:', error)
        router.push('/admin/blogs/categories')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategory()
  }, [id, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!category) {
    return null
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>
      <CategoryForm category={category} />
    </div>
  )
} 