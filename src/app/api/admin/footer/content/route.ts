import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseApiClient } from '@/lib/supabase/api'

// GET: Fetch active footer content
export async function GET() {
  try {
    // Auth check
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Allow all roles to view
    const adminSupabase = await createSupabaseAdminClient()
    const { data: content, error } = await adminSupabase
      .from('footer_content')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ content: content || null })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update active footer content (admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Check admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const adminSupabase = await createSupabaseAdminClient()
    const contentData = await request.json()
    // Get current active content
    const { data: currentContent } = await adminSupabase
      .from('footer_content')
      .select('id')
      .eq('is_active', true)
      .single()
    if (!currentContent) {
      return NextResponse.json({ error: 'No active content found' }, { status: 404 })
    }
    // Update the current content
    const { data, error } = await adminSupabase
      .from('footer_content')
      .update({ ...contentData, updated_at: new Date().toISOString() })
      .eq('id', currentContent.id)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ content: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 