'use client'

import { CategoryForm } from '@/components/admin/blogs/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">New Category</h1>
      <CategoryForm />
    </div>
  )
} 
