import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    console.log('Footer layout API: Starting request')
    
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Footer layout API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Footer layout API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const adminSupabase = await createSupabaseAdminClient()
    console.log('Footer layout API: Supabase client created')
    
    // Get the active footer layout settings
    const { data: layout, error } = await adminSupabase
      .from('footer_layout')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Footer layout API: Error fetching layout:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Footer layout API: Found layout:', layout ? 'yes' : 'no')

    return NextResponse.json({ 
      layout: layout || null
    })

  } catch (error) {
    console.error('Footer layout API: Error in layout API:', error)
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
      console.error('Footer layout API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Footer layout API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminSupabase = await createSupabaseAdminClient()
    const layoutData = await request.json()
    
    // Validate required fields
    if (!layoutData.column_layout) {
      return NextResponse.json({ error: 'Column layout is required' }, { status: 400 })
    }

    // Deactivate all existing layouts
    await adminSupabase
      .from('footer_layout')
      .update({ is_active: false })
      .eq('is_active', true)

    // Create new layout settings
    const { data, error } = await adminSupabase
      .from('footer_layout')
      .insert([{
        column_layout: layoutData.column_layout,
        show_logo: layoutData.show_logo ?? true,
        show_navigation: layoutData.show_navigation ?? true,
        show_contact: layoutData.show_contact ?? true,
        show_social: layoutData.show_social ?? true,
        show_cta: layoutData.show_cta ?? true,
        show_policy_links: layoutData.show_policy_links ?? true,
        show_copyright: layoutData.show_copyright ?? true,
        spacing: layoutData.spacing || 'normal',
        alignment: layoutData.alignment || 'left',
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Footer layout API: Error creating layout:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ layout: data })
  } catch (error) {
    console.error('Footer layout API: Error creating layout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication first
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Footer layout API: Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('Footer layout API: User is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminSupabase = await createSupabaseAdminClient()
    const layoutData = await request.json()
    
    // Get the current active layout
    const { data: currentLayout } = await adminSupabase
      .from('footer_layout')
      .select('id')
      .eq('is_active', true)
      .single()

    if (!currentLayout) {
      return NextResponse.json({ error: 'No active layout found' }, { status: 404 })
    }

    // Update the current layout
    const { data, error } = await adminSupabase
      .from('footer_layout')
      .update({
        column_layout: layoutData.column_layout,
        show_logo: layoutData.show_logo,
        show_navigation: layoutData.show_navigation,
        show_contact: layoutData.show_contact,
        show_social: layoutData.show_social,
        show_cta: layoutData.show_cta,
        show_policy_links: layoutData.show_policy_links,
        show_copyright: layoutData.show_copyright,
        spacing: layoutData.spacing,
        alignment: layoutData.alignment,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentLayout.id)
      .select()
      .single()

    if (error) {
      console.error('Footer layout API: Error updating layout:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ layout: data })
  } catch (error) {
    console.error('Footer layout API: Error updating layout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 