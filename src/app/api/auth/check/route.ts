import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseApiClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    
    return NextResponse.json({ 
      authenticated: true, 
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 