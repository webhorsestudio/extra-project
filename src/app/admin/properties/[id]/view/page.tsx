import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/lib/admin-data'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PropertyViewPage({ params }: PageProps) {
  await checkAdminAuth()
  const { id } = await params
  
  // Redirect to the web layout single property page
  redirect(`/properties/${id}`)
}
