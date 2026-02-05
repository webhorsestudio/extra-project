import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseApiClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || ''
    const slug = searchParams.get('slug') || ''

    // Build the query - only fetch active policies
    let query = supabase
      .from('policies')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Apply type filter if provided
    if (type) {
      query = query.eq('policy_type', type)
    }

    // Apply slug filter if provided (for specific policy lookup)
    if (slug) {
      // You might want to add a slug field to policies table later
      // For now, we'll search by name
      query = query.ilike('name', `%${slug}%`)
    }

    const { data: policies, error } = await query

    if (error) {
      console.error('Policies API: Error fetching policies:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      policies: policies || [],
      total: policies?.length || 0
    })

  } catch (error) {
    console.error('Policies API: Error in policies API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 