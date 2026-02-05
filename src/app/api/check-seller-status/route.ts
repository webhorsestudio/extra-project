import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseApiClient()

    // Simple check: does the email exist in property_developers table?
    const { data: developer, error } = await supabase
      .from('property_developers')
      .select('id, name, contact_info, logo_url')
      .eq('is_active', true)
      .ilike('contact_info->>email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - user is not a seller
        return NextResponse.json({
          isSeller: false,
          message: 'User is not registered as a seller'
        })
      }
      
      console.error('Error checking seller status:', error)
      return NextResponse.json(
        { error: 'Failed to check seller status' },
        { status: 500 }
      )
    }

    // User is a seller
    return NextResponse.json({
      isSeller: true,
      seller: {
        id: developer.id,
        name: developer.name,
        email: developer.contact_info?.email || email,
        logo_url: developer.logo_url
      },
      message: 'User is a registered seller'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 