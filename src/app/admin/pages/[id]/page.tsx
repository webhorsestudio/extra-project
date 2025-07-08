import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import PageForm from '@/components/admin/pages/PageForm'

interface EditPagePageProps {
  params: {
    id: string
  }
}

export default async function EditPagePage({ params }: EditPagePageProps) {
  const supabase = await createSupabaseServerClient()

  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !page) {
    notFound()
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Page</h1>
      <PageForm page={page} />
    </div>
  )
} 