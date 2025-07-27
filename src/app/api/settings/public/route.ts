import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: () => undefined } }
  );

  const SETTINGS_UUID = 'ed4ebb8c-40cd-4173-b492-fef97713217b';
  const { data: settings, error } = await supabase
    .from('settings')
    .select('email_confirmation_enabled')
    .eq('id', SETTINGS_UUID)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ settings });
} 