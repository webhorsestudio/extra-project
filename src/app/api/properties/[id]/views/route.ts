import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = await createSupabaseApiClient()
    
    // Get user IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Check if view already exists for this IP and user agent in the last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { data: existingView } = await supabase
      .from('property_views')
      .select('id')
      .eq('property_id', id)
      .eq('viewer_ip', ip)
      .eq('user_agent', userAgent)
      .gte('created_at', yesterday.toISOString())
      .single()

    if (existingView) {
      return NextResponse.json({ message: 'View already recorded' })
    }

    // Record the view
    const { error } = await supabase
      .from('property_views')
      .insert([{
        property_id: id,
        viewer_ip: ip,
        user_agent: userAgent,
        viewed_at: new Date().toISOString()
      }])

    if (error) {
      console.error('Error recording property view:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'View recorded successfully' })
  } catch (error) {
    console.error('Error in property view API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = await createSupabaseApiClient()
    
    // Get view count for this property
    const { count, error } = await supabase
      .from('property_views')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', id)

    if (error) {
      console.error('Error fetching property views:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      views: count || 0,
      property_id: id
    })
  } catch (error) {
    console.error('Error in property views API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 