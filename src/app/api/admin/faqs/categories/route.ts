import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin FAQ Categories API: Starting request')
    
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Admin FAQ Categories API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin FAQ Categories API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const adminSupabase = await createSupabaseAdminClient()
    console.log('Admin FAQ Categories API: Supabase client created')

    // Get categories with FAQ count
    const { data: categories, error } = await adminSupabase
      .from('faq_categories')
      .select(`
        *,
        faqs:faqs(count)
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Admin FAQ Categories API: Error fetching categories:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Admin FAQ Categories API: Found categories:', categories?.length || 0)

    // Transform the data to include FAQ count
    const transformedCategories = categories?.map(category => ({
      ...category,
      faq_count: category.faqs?.[0]?.count || 0
    })) || []

    return NextResponse.json({ 
      categories: transformedCategories,
      total: transformedCategories.length
    })

  } catch (error) {
    console.error('Admin FAQ Categories API: Error in categories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Admin FAQ Categories API: Creating new category')
    
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Admin FAQ Categories API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Admin FAQ Categories API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const adminSupabase = await createSupabaseAdminClient()
    const body = await request.json()
    
    const { name, description } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const { data: existingCategory } = await adminSupabase
      .from('faq_categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      )
    }

    // Create the category
    const { data: category, error } = await adminSupabase
      .from('faq_categories')
      .insert({
        name: name.trim(),
        slug,
        description: description?.trim() || null
      })
      .select()
      .single()

    if (error) {
      console.error('Admin FAQ Categories API: Error creating category:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Admin FAQ Categories API: Category created successfully')

    return NextResponse.json({ 
      category,
      message: 'Category created successfully'
    })

  } catch (error) {
    console.error('Admin FAQ Categories API: Error in POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 