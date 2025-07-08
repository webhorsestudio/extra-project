"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag } from 'lucide-react'
import CategoryForm from '@/components/admin/properties/CategoryForm'
import CategoryList from '@/components/admin/properties/CategoryList'

export default function CategoryClient({ categories: initialCategories }: { categories: any[] }) {
  const [refresh, setRefresh] = useState(0)
  const [categories, setCategories] = useState(initialCategories)

  // Optionally, you can implement a refetch here if needed

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
        <CategoryForm onSuccess={() => setRefresh(r => r + 1)} />
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
          <CategoryList onChange={() => setRefresh(r => r + 1)} key={refresh} categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
} 