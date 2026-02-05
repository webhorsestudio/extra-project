import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { CreatePublicListingData } from '@/types/public-listing'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin public listings API: Starting request')
    
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Admin public listings API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin public listings API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const adminSupabase = await createSupabaseAdminClient()
    console.log('Admin public listings API: Supabase client created')
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('Admin public listings API: Query params:', { search, type, status, limit, offset })

    // Build the query
    let query = adminSupabase
      .from('public_listings')
      .select('*')
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

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    console.log('Admin public listings API: Executing query...')
    const { data: listings, error } = await query

    if (error) {
      console.error('Admin public listings API: Error fetching listings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = adminSupabase
      .from('public_listings')
      .select('*', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,slug.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }
    if (type) {
      countQuery = countQuery.eq('type', type)
    }
    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Admin public listings API: Error getting count:', countError)
    }

    console.log('Admin public listings API: Found listings:', listings?.length || 0)

    return NextResponse.json({ 
      listings: listings || [],
      total: count || 0,
      offset,
      limit
    })

  } catch (error) {
    console.error('Admin public listings API: Error in listings API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Admin public listings API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin public listings API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminSupabase = await createSupabaseAdminClient()
    const listingData: CreatePublicListingData = await request.json()
    
    if (!listingData.title || !listingData.slug || !listingData.type) {
      return NextResponse.json({ 
        error: 'Title, slug, and type are required' 
      }, { status: 400 })
    }

    // Check if slug already exists
    const { data: existingListing } = await adminSupabase
      .from('public_listings')
      .select('id')
      .eq('slug', listingData.slug)
      .single()

    if (existingListing) {
      return NextResponse.json({ 
        error: 'A listing with this slug already exists' 
      }, { status: 400 })
    }

    const { data, error } = await adminSupabase
      .from('public_listings')
      .insert([{
        ...listingData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Admin public listings API: Error creating listing:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ listing: data })
  } catch (error) {
    console.error('Admin public listings API: Error creating listing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
