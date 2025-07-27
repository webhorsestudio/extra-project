import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

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
    const adminSupabase = await createSupabaseAdminClient()

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

    // Check if user already exists in auth
    const { data: existingUser } = await adminSupabase.auth.admin.listUsers()
    const userExists = existingUser.users.find(u => u.email === email)
    
    if (userExists) {
      return NextResponse.json(
        { error: 'A user with this email already exists. Please log in instead.' },
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

    // Create user account in auth system
    const generatedPassword = Math.random().toString(36).slice(-12); // Generate random password
    
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email: email,
      password: generatedPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: name,
        role: 'customer' // Default role, can be updated later
      }
    });

    if (authError) {
      console.error('Error creating user account:', authError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

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
      // Clean up the created user if developer creation fails
      if (authUser.user) {
        await adminSupabase.auth.admin.deleteUser(authUser.user.id);
      }
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
        id: authUser.user.id,
        email: authUser.user.email,
        password: generatedPassword // Return password for auto-login
      },
      message: 'Developer account created successfully'
    })

  } catch (error) {
    console.error('Unexpected error in seller registration API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 