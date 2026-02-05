import React from 'react'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import MobilePublicListingsClient from './MobilePublicListingsClient'

export default async function MobilePublicListingsPage() {
  const supabase = await createSupabaseApiClient()
  
  // Fetch public listings data server-side
  const { data: listings, error } = await supabase
    .from('public_listings')
    .select('*')
    .eq('status', 'published')
    .or('expire_date.is.null,expire_date.gt.now()')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching public listings:', error)
  }

  return <MobilePublicListingsClient initialListings={listings || []} />
}
