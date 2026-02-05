import { NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET() {
  const supabase = await createSupabaseApiClient()
  const { data, error } = await supabase
    .from('settings')
    .select('favicon_url')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ favicon_url: data?.favicon_url })
} 