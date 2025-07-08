import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    console.log('Blogs API: Starting request')
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')
    
    const supabase = await createSupabaseApiClient()
    
    console.log(`Attempting to fetch latest blogs (limit: ${limit})...`)
    
    const { data, error } = await supabase
      .from('blogs_with_categories')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit)

    console.log('Supabase response for blogs:', { 
      dataCount: data?.length || 0, 
      error: error?.message || null, 
      hasData: !!data, 
      hasError: !!error 
    })

    if (error) {
      console.error('Error fetching blogs:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Successfully fetched blogs:', data?.length || 0, 'blogs')

    // Map the data to match the expected schema
    const blogs = (data || []).map(blog => ({
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      featured_image: blog.featured_image,
      created_at: blog.created_at,
      categories: blog.categories || []
    }))

    return NextResponse.json({ 
      blogs: blogs,
      total: blogs.length
    })

  } catch (error) {
    console.error('Blogs API: Error in blogs API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 