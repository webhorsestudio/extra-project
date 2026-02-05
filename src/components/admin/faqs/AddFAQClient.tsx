'use client'

import { useRouter } from 'next/navigation'
import { AddFAQForm } from './AddFAQForm'

export default function AddFAQClient() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/admin/faqs')
  }

  const handleCancel = () => {
    router.push('/admin/faqs')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add New FAQ</h1>
        <button
          onClick={handleCancel}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to FAQs
        </button>
      </div>
      <AddFAQForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  )
} 