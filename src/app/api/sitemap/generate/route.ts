import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseApiClient()

  try {
    // Check if we're in development mode and allow bypass
    const isDevelopment = process.env.NODE_ENV === 'development'
    const bypassAuth = request.headers.get('x-bypass-auth') === 'true'
    
    if (!isDevelopment || !bypassAuth) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // Check if the current user has admin role
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !currentUserProfile || currentUserProfile.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin privileges required' },
          { status: 403 }
        )
      }
    }

    // Generate sitemap logic here
    // This is a placeholder - implement actual sitemap generation
    
    return NextResponse.json({
      success: true,
      message: 'Sitemap generation started'
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 