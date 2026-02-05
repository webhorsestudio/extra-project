import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) { 
  try {
    // Check authentication first
    const { createSupabaseApiClient } = await import('@/lib/supabase/api')
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service role client for admin operations to bypass RLS
    const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')
    const adminSupabase = await createSupabaseAdminClient()
    
    const { email, password, full_name, role } = await request.json()
    
    // Validate required fields
    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ 
        error: 'Email, password, full name, and role are required' 
      }, { status: 400 })
    }
    
    // Validate role
    if (!['admin', 'agent', 'customer'].includes(role)) {
      return NextResponse.json({ 
        error: 'Invalid role. Must be admin, agent, or customer' 
      }, { status: 400 })
    }
    
    // Create the user in auth.users
    const { data: authData, error: createAuthError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name
      }
    })
    
    if (createAuthError) {
      console.error('Auth user creation error:', createAuthError)
      return NextResponse.json({ error: createAuthError.message }, { status: 400 })
    }
    
    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }
    
    // Create the profile directly (bypassing the trigger)
    const { data: profileData, error: profileError } = await adminSupabase
      .from('profiles')
      .upsert([{
        id: authData.user.id,
        full_name,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Try to clean up the auth user if profile creation fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        role,
        created_at: profileData.created_at
      }
    })
    
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) { 
  try {
    // Check authentication first
    const { createSupabaseApiClient } = await import('@/lib/supabase/api')
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service role client for admin operations to bypass RLS
    const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')
    const adminSupabase = await createSupabaseAdminClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build the query
    let query = adminSupabase
      .from('profiles')
      .select('id, full_name, role, created_at, updated_at')
      .order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply search filter (only search by full_name since email is in auth.users)
    if (search) {
      query = query.ilike('full_name', `%${search}%`)
    }

    // Apply role filter
    if (role !== 'all') {
      query = query.eq('role', role)
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no users found, return empty array
    if (!users || users.length === 0) {
      return NextResponse.json({ 
        users: [],
        total: 0
      })
    }

    // Transform the data to include email from auth.users
    const usersWithEmail = await Promise.all(
      users.map(async (user) => {
        try {
          const { data: authUser } = await adminSupabase.auth.admin.getUserById(user.id)
          
          return {
            id: user.id,
            email: authUser?.user?.email || 'N/A',
            full_name: user.full_name || 'N/A',
            role: user.role || 'customer',
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        } catch (error) {
          console.error(`Error fetching email for user ${user.id}:`, error)
          return {
            id: user.id,
            email: 'N/A',
            full_name: user.full_name || 'N/A',
            role: user.role || 'customer',
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        }
      })
    )

    return NextResponse.json({ 
      users: usersWithEmail,
      total: usersWithEmail.length
    })

  } catch (error) {
    console.error('Error in users API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
