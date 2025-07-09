import ServerLayout from '@/components/web/ServerLayout'
import FaqsList from './FaqsList'
import { getFAQsData, getFAQCategoriesData } from '@/lib/faqs-data-server'

export default async function FaqsPage() {
  const initialFaqs = await getFAQsData()
  const initialCategories = await getFAQCategoriesData()
  return (
    <ServerLayout showCategoryBar={false}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">FAQ&apos;s</h1>
        <hr className="mb-8" />
        <FaqsList initialFaqs={initialFaqs} initialCategories={initialCategories} />
      </div>
    </ServerLayout>
  )
} 