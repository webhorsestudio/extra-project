import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth } from '@/lib/admin-data'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication using the improved function
    const { user, profile, error: authError } = await checkAdminAuth()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role client for admin operations to bypass RLS
    const adminSupabase = await createSupabaseAdminClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const type = searchParams.get('type') || 'all'
    const priority = searchParams.get('priority') || 'all'

    // Build the query
    let query = adminSupabase
      .from('inquiries')
      .select(`
        *,
        property:properties(id, title)
      `)
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%,subject.ilike.%${search}%`)
    }

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply type filter
    if (type !== 'all') {
      query = query.eq('inquiry_type', type)
    }

    // Apply priority filter
    if (priority !== 'all') {
      query = query.eq('priority', priority)
    }

    const { data: inquiries, error } = await query

    if (error) {
      console.error('Admin inquiries API: Error fetching inquiries:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      inquiries: inquiries || [],
      total: inquiries?.length || 0
    })

  } catch (error) {
    console.error('Admin inquiries API: Error in inquiries API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 