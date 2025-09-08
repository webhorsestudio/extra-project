import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.event || !body.category || !body.action) {
      return NextResponse.json(
        { error: 'Missing required fields: event, category, action' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseApiClient()

    // Store SEO event data
    const { error } = await supabase
      .from('seo_events')
      .insert({
        event: body.event,
        category: body.category,
        action: body.action,
        label: body.label,
        value: body.value,
        custom_parameters: body.customParameters || {},
        url: body.url,
        user_agent: body.userAgent,
        referrer: body.referrer,
        timestamp: new Date(body.timestamp || Date.now()).toISOString(),
      })

    if (error) {
      console.error('Error storing SEO event:', error)
      return NextResponse.json(
        { error: 'Failed to store SEO event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing SEO event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
