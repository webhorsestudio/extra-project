import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Admin notification API: Fetching notification:', id)
    
    const supabase = await createSupabaseAdminClient()
    
    const { data: notification, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Admin notification API: Error fetching notification:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    console.log('Admin notification API: Notification fetched successfully')
    return NextResponse.json({ notification })

  } catch (error) {
    console.error('Admin notification API: Error in GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Admin notification API: Updating notification:', id)
    
    const supabase = await createSupabaseAdminClient()
    const body = await request.json()
    
    const { status } = body

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Update the notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Admin notification API: Error updating notification:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    console.log('Admin notification API: Notification updated successfully')
    return NextResponse.json({ 
      notification,
      message: 'Notification updated successfully'
    })

  } catch (error) {
    console.error('Admin notification API: Error in PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Admin notification API: Deleting notification:', id)
    
    const supabase = await createSupabaseAdminClient()
    
    // Check if notification exists
    const { data: existingNotification, error: fetchError } = await supabase
      .from('notifications')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Admin notification API: Error checking notification:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // Delete the notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Admin notification API: Error deleting notification:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Admin notification API: Notification deleted successfully')
    return NextResponse.json({ 
      message: 'Notification deleted successfully'
    })

  } catch (error) {
    console.error('Admin notification API: Error in DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 