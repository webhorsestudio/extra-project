import { Metadata } from 'next'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { TestimonialsManager } from '@/components/admin/testimonials/TestimonialsManager'

export const metadata: Metadata = {
  title: 'Testimonials - Frontend UI',
  description: 'Manage homepage testimonials shown on the public website.',
}

export default async function TestimonialsAdminPage() {
  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('home_testimonials')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching testimonials for admin view:', error)
  }

  return (
    <div className="container py-6">
      <TestimonialsManager initialTestimonials={data || []} />
    </div>
  )
}


