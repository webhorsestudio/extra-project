import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // Only fetch notifications that are not expired
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .gt('expires_at', new Date().toISOString())
      
    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Get creator info
    const creatorIds = notifications?.map(n => n.created_by).filter(Boolean) || []
    let creators: Array<{ id: string; full_name: string }> = []
    
    if (creatorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', creatorIds)
      creators = profiles || []
    }
    
    const transformedNotifications = notifications?.map(notification => {
      const creator = creators.find(c => c.id === notification.created_by)
      return {
        ...notification,
        creator_name: creator?.full_name || 'System'
      }
    }) || []
    
    return NextResponse.json({ notifications: transformedNotifications })
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 