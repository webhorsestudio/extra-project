import { redirect } from 'next/navigation'

export default function AddFAQCategoryPage() {
  // Redirect to the main categories page where add functionality is available
  redirect('/admin/faqs/categories')
} 