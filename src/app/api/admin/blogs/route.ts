import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin Blogs API: Starting request')
    
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Admin Blogs API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin Blogs API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    // Build query
    let query = supabase
      .from('blogs')
      .select(`
        *,
        category:blog_categories(name, slug)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }

    const { data: blogs, error } = await query

    if (error) {
      console.error('Admin Blogs API: Error fetching blogs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Admin Blogs API: Found blogs:', blogs?.length || 0)

    return NextResponse.json({ 
      blogs: blogs || [],
      total: blogs?.length || 0
    })

  } catch (error) {
    console.error('Admin Blogs API: Error in blogs API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Admin Blogs API: Starting POST request')
    
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Admin Blogs API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin Blogs API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const blogData = await request.json()

    const { data: blog, error } = await supabase
      .from('blogs')
      .insert([blogData])
      .select(`
        *,
        category:blog_categories(name, slug)
      `)
      .single()

    if (error) {
      console.error('Admin Blogs API: Error creating blog:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Admin Blogs API: Blog created successfully')

    return NextResponse.json({ blog })

  } catch (error) {
    console.error('Admin Blogs API: Error in blog creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 