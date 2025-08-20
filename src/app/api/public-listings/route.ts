import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('Public Listings API: Starting request')
    
    const supabase = await createSupabaseAdminClient()
    console.log('Public Listings API: Supabase client created')
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('Public Listings API: Query params:', { search, type, limit, offset })

    // Build the query - only published listings that haven't expired
    let query = supabase
      .from('public_listings')
      .select('*')
      .eq('status', 'published')
      .or('expire_date.is.null,expire_date.gt.now()')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }

    // Apply type filter
    if (type) {
      query = query.eq('type', type)
    }

    console.log('Public Listings API: Executing query...')
    const { data: listings, error } = await query

    if (error) {
      console.error('Public Listings API: Error fetching listings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('public_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .or('expire_date.is.null,expire_date.gt.now()')

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,slug.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }
    if (type) {
      countQuery = countQuery.eq('type', type)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Public Listings API: Error getting count:', countError)
    }

    console.log('Public Listings API: Found listings:', listings?.length || 0)

    return NextResponse.json({ 
      listings: listings || [],
      total: count || 0,
      offset,
      limit
    })

  } catch (error) {
    console.error('Public Listings API: Error in listings API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
