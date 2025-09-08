import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const limit = parseInt(searchParams.get('limit') || '20')

    // Fetch alerts
    const { data: alerts, error } = await supabase
      .from('seo_alerts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching SEO alerts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch SEO alerts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: alerts || [] })
  } catch (error) {
    console.error('Error fetching SEO alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SEO alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createSupabaseAdminClient()

    // Create new alert
    const { data, error } = await supabase
      .from('seo_alerts')
      .insert({
        alert_type: body.alert_type,
        severity: body.severity,
        title: body.title,
        message: body.message,
        url: body.url,
        threshold_value: body.threshold_value,
        current_value: body.current_value,
        metric_name: body.metric_name,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating SEO alert:', error)
      return NextResponse.json(
        { error: 'Failed to create SEO alert' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating SEO alert:', error)
    return NextResponse.json(
      { error: 'Failed to create SEO alert' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createSupabaseAdminClient()

    // Update alert status
    const { data, error } = await supabase
      .from('seo_alerts')
      .update({
        status: body.status,
        acknowledged_at: body.status === 'acknowledged' ? new Date().toISOString() : null,
        resolved_at: body.status === 'resolved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating SEO alert:', error)
      return NextResponse.json(
        { error: 'Failed to update SEO alert' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating SEO alert:', error)
    return NextResponse.json(
      { error: 'Failed to update SEO alert' },
      { status: 500 }
    )
  }
}
