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
    const description = formEntries.description?.toString().trim() || '';
    const city = formEntries.city?.toString().trim() || '';
    const state = formEntries.state?.toString().trim() || '';
    const zipCode = formEntries.zipCode?.toString().trim() || '';
    const country = formEntries.country?.toString().trim() || '';

    // Get the logo file
    const logoFile = formEntries.logo as File | null;

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

    // REQUIRE AUTHENTICATION - Only authenticated users can register as sellers
    const { data: { user: authenticatedUser }, error: authCheckError } = await supabase.auth.getUser()
    
    if (authCheckError || !authenticatedUser) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to register as a seller.' },
        { status: 401 }
      )
    }

    // Verify the email matches the authenticated user's email
    if (authenticatedUser.email !== email) {
      return NextResponse.json(
        { error: 'Email does not match your logged-in account. Please use your account email.' },
        { status: 400 }
      )
    }

    // Check if seller already exists with this email
    const { data: existingSeller } = await supabase
      .from('property_developers')
      .select('id')
      .eq('contact_info->>email', email)
      .single()

    if (existingSeller) {
      return NextResponse.json(
        { error: 'A developer with this email already exists' },
        { status: 409 }
      )
    }

    // Handle logo upload if provided
    let logoUrl = null;
    let logoStoragePath = null;

    if (logoFile && logoFile instanceof File) {
      try {
        // Validate file type
        if (!logoFile.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'Logo must be an image file' },
            { status: 400 }
          );
        }

        // Validate file size (max 5MB)
        if (logoFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Logo file size must be less than 5MB' },
            { status: 400 }
          );
        }

        // Generate unique filename
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `developer-logo-${Date.now()}.${fileExt}`;

        // Upload logo to Supabase Storage using the same bucket as admin
        const { error: uploadError } = await supabase.storage
          .from('developer-logos')
          .upload(fileName, logoFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Logo upload error:', uploadError);
          return NextResponse.json(
            { error: 'Failed to upload logo. Please try again.' },
            { status: 500 }
          );
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('developer-logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
        logoStoragePath = fileName;

      } catch (uploadError) {
        console.error('Logo upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload logo. Please try again.' },
          { status: 500 }
        );
      }
    }

    // User is already authenticated - no need to create user account

    // Create new developer record
    const { data: newSeller, error } = await supabase
      .from('property_developers')
      .insert({
        name,
        website,
        address: address ? `${address}, ${city}, ${state} ${zipCode}, ${country}` : null,
        logo_url: logoUrl,
        logo_storage_path: logoStoragePath,
        contact_info: {
          phone,
          email,
          office_hours,
          description
        },
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating developer:', error)
      return NextResponse.json(
        { error: 'Failed to create developer account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      seller: {
        id: newSeller.id,
        name: newSeller.name,
        email: newSeller.contact_info?.email,
        logo_url: newSeller.logo_url
      },
      user: {
        id: authenticatedUser.id,
        email: authenticatedUser.email
      },
      message: 'Seller account created successfully. You can now add properties.'
    })

  } catch (error) {
    console.error('Unexpected error in seller registration API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 