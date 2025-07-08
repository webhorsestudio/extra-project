import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  // Redirect to homepage
  return NextResponse.redirect(new URL('/', request.url), { status: 302 })
} 