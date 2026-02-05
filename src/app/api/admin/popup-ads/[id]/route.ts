import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseAdminClient()
    
    const { data: popupAd, error } = await supabase
      .from('popup_ads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!popupAd) {
      return NextResponse.json({ error: 'Popup ad not found' }, { status: 404 })
    }

    return NextResponse.json({ popupAd })
  } catch (error) {
    console.error('Error in popup ad GET:', error)
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
    const { id } = await params
    const supabase = await createSupabaseAdminClient()
    
    const body = await request.json()
    
    // Clean up the data - convert empty strings to undefined for date fields
    const cleanedBody = {
      ...body,
      start_date: body.start_date && body.start_date.trim() !== '' ? body.start_date : undefined,
      end_date: body.end_date && body.end_date.trim() !== '' ? body.end_date : undefined
    }

    const { data, error } = await supabase
      .from('popup_ads')
      .update(cleanedBody)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ popupAd: data })
  } catch (error) {
    console.error('Error in popup ad PUT:', error)
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
    const { id } = await params
    const supabase = await createSupabaseAdminClient()
    
    const { error } = await supabase
      .from('popup_ads')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Popup ad deleted successfully' })
  } catch (error) {
    console.error('Error in popup ad DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
