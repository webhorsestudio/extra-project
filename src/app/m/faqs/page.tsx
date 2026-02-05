import { getFAQsData, getFAQCategoriesData } from '@/lib/faqs-data-server'
import MobileFaqsClient from './MobileFaqsClient'

export default async function MobileFaqsPage() {
  const initialFaqs = await getFAQsData()
  const initialCategories = await getFAQCategoriesData()
  
  return (
    <MobileFaqsClient 
      initialFaqs={initialFaqs} 
      initialCategories={initialCategories} 
    />
  )
} 