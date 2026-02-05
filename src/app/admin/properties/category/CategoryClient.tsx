"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag } from 'lucide-react'
import CategoryForm from '@/components/admin/properties/CategoryForm'
import CategoryList from '@/components/admin/properties/CategoryList'

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  icon?: string;
  is_active?: boolean;
};

export default function CategoryClient({ categories: initialCategories }: { categories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories')
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error in fetchCategories:', error)
    }
  }, [])

  // Only refetch if initial data is empty (fallback)
  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      fetchCategories()
    }
  }, [initialCategories, fetchCategories])

  const handleRefresh = () => {
    fetchCategories()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground">
            Manage property categories and types
          </p>
        </div>
        <CategoryForm onSuccess={handleRefresh} />
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Property Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryList onChange={handleRefresh} categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
} 