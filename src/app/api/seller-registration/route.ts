import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function POST(request: NextRequest) {
  try {
    const formDataRaw = await request.formData();
    const formEntries = Object.fromEntries(formDataRaw.entries());

    // Extract fields from flat FormData
    const name = formEntries.name?.toString().trim() || '';
    const website = formEntries.website?.toString().trim() || null;
    const address = formEntries.address?.toString().trim() || null;
    const email = formEntries.email?.toString().trim() || '';
    const phone = formEntries.phone?.toString().trim() || '';
    const office_hours = formEntries.officeHours?.toString().trim() || '';

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseApiClient()

    // Check if seller already exists with this email
    const { data: existingSeller } = await supabase
      .from('property_developers')
      .select('id')
      .eq('contact_info->>email', email)
      .single()

    if (existingSeller) {
      return NextResponse.json(
        { error: 'A seller with this email already exists' },
        { status: 409 }
      )
    }

    // Create new seller record
    const { data: newSeller, error } = await supabase
      .from('property_developers')
      .insert({
        name,
        website,
        address,
        logo_url: null, // Not handling logo upload yet
        logo_storage_path: null, // Not handling logo upload yet
        contact_info: {
          phone,
          email,
          office_hours
        },
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating seller:', error)
      return NextResponse.json(
        { error: 'Failed to create seller account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      seller: {
        id: newSeller.id,
        name: newSeller.name,
        email: newSeller.contact_info?.email
      },
      message: 'Seller account created successfully'
    })

  } catch (error) {
    console.error('Unexpected error in seller registration API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 