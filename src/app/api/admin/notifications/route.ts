import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin notifications API: Starting request')
    
    const supabase = await createSupabaseAdminClient()
    console.log('Admin notifications API: Supabase client created')
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category') || 'all'

    console.log('Admin notifications API: Query params:', { search, status, type, category })

    // Build the query
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`)
    }

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply type filter
    if (type !== 'all') {
      query = query.eq('type', type)
    }

    // Apply category filter
    if (category !== 'all') {
      query = query.eq('category', category)
    }

    console.log('Admin notifications API: Executing query...')
    const { data: notifications, error } = await query

    if (error) {
      console.error('Admin notifications API: Error fetching notifications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Admin notifications API: Found notifications:', notifications?.length || 0)

    // Get creator information separately if needed
    const creatorIds = notifications?.map(n => n.created_by).filter(Boolean) || []
    let creators: { id: string; full_name: string }[] = []
    
    if (creatorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', creatorIds)
      
      creators = profiles || []
    }

    // Transform the data to include creator name
    const transformedNotifications = notifications?.map(notification => {
      const creator = creators.find(c => c.id === notification.created_by)
      return {
        ...notification,
        creator_name: creator?.full_name || 'Admin'
      }
    }) || []

    return NextResponse.json({ 
      notifications: transformedNotifications,
      total: transformedNotifications.length
    })

  } catch (error) {
    console.error('Admin notifications API: Error in notifications API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Admin notifications API: Creating new notification')
    
    const supabase = await createSupabaseAdminClient()
    const body = await request.json()
    
    const { title, message, type, category } = body

    // Validate required fields
    if (!title || !message || !type || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        title,
        message,
        type,
        category,
        status: 'unread'
      })
      .select()
      .single()

    if (error) {
      console.error('Admin notifications API: Error creating notification:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Admin notifications API: Notification created successfully')

    return NextResponse.json({ 
      notification,
      message: 'Notification created successfully'
    })

  } catch (error) {
    console.error('Admin notifications API: Error in POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 