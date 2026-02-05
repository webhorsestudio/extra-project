import { createSupabaseAdminUserClient } from '@/lib/supabase/admin'
import { createSupabaseServerClientSafe } from '@/lib/supabase/server-fallback'
import type { Testimonial } from '@/types/testimonial'

/**
 * Fetch testimonials visible to public web experience.
 * Returns active testimonials ordered by order_index then created_at.
 */
export async function getActiveTestimonials(limit: number | null = null): Promise<Testimonial[]> {
  try {
    const supabase = await createSupabaseAdminUserClient()
    let query = supabase
      .from('home_testimonials')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true })

    if (typeof limit === 'number' && limit > 0) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching active home testimonials:', error)
      return []
    }

    return (data as Testimonial[]) || []
  } catch (error) {
    console.error('Unexpected error fetching active testimonials:', error)
    return []
  }
}

/**
 * Admin helper to fetch testimonials bypassing requester context.
 * Falls back to anon client if service client fails.
 */
export async function getAllTestimonialsForAdmin(): Promise<Testimonial[]> {
  try {
    const supabase = await createSupabaseAdminUserClient()
    const { data, error } = await supabase
      .from('home_testimonials')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching testimonials for admin:', error)
      return []
    }

    return (data as Testimonial[]) || []
  } catch (error) {
    console.warn('Falling back to server client fallback for testimonials:', error)
    try {
      const fallback = await createSupabaseServerClientSafe()
      const { data, error: fallbackError } = await fallback
        .from('home_testimonials')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true })

      if (fallbackError) {
        console.error('Fallback testimonial fetch failed:', fallbackError)
        return []
      }

      return (data as Testimonial[]) || []
    } catch (finalError) {
      console.error('Unable to fetch testimonials with fallback:', finalError)
      return []
    }
  }
}


