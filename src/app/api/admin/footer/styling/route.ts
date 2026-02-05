import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseApiClient } from '@/lib/supabase/api'

// GET: Fetch active footer styling
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
    const { data: styling, error } = await adminSupabase
      .from('footer_styling')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ styling: styling || null })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update active footer styling (admin only)
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
    const stylingData = await request.json()
    // Get current active styling
    const { data: currentStyling } = await adminSupabase
      .from('footer_styling')
      .select('id')
      .eq('is_active', true)
      .single()
    if (!currentStyling) {
      return NextResponse.json({ error: 'No active styling found' }, { status: 404 })
    }
    // Update the current styling
    const { data, error } = await adminSupabase
      .from('footer_styling')
      .update({ ...stylingData, updated_at: new Date().toISOString() })
      .eq('id', currentStyling.id)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ styling: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 