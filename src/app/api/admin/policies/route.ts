import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin policies API: Starting request')
    
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Admin policies API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin policies API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const adminSupabase = await createSupabaseAdminClient()
    console.log('Admin policies API: Supabase client created')
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''

    console.log('Admin policies API: Query params:', { search, type })

    // Build the query
    let query = adminSupabase
      .from('policies')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // Apply type filter
    if (type) {
      query = query.eq('policy_type', type)
    }

    console.log('Admin policies API: Executing query...')
    const { data: policies, error } = await query

    if (error) {
      console.error('Admin policies API: Error fetching policies:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Admin policies API: Found policies:', policies?.length || 0)

    return NextResponse.json({ 
      policies: policies || [],
      total: policies?.length || 0
    })

  } catch (error) {
    console.error('Admin policies API: Error in policies API:', error)
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
      console.error('Admin policies API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin policies API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminSupabase = await createSupabaseAdminClient()
    const { name, description, content, policy_type = 'general', is_active = true } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Policy name is required' }, { status: 400 })
    }

    const { data, error } = await adminSupabase
      .from('policies')
      .insert([{ 
        name, 
        description, 
        content, 
        policy_type, 
        is_active 
      }])
      .select('*')
      .single()

    if (error) {
      console.error('Admin policies API: Error creating policy:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ policy: data })
  } catch (error) {
    console.error('Admin policies API: Error creating policy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 