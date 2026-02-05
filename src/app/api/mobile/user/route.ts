import { NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET() {
  try {
    const supabase = await createSupabaseApiClient()
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        user: null,
        profile: null,
        isAuthenticated: false 
      })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        avatar_data,
        role,
        phone,
        created_at,
        updated_at
      `)
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json({ 
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata
        },
        profile: null,
        isAuthenticated: true 
      })
    }

    // Return mobile-optimized user data
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      },
      profile: {
        id: profile?.id,
        full_name: profile?.full_name,
        email: user.email,
        avatar_data: profile?.avatar_data,
        role: profile?.role,
        phone: profile?.phone,
        created_at: profile?.created_at,
        updated_at: profile?.updated_at
      },
      isAuthenticated: true
    })
  } catch (error) {
    console.error('Unexpected error in mobile user API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 