import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  const cookieStore = req.cookies;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // Auth check
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  // Fetch settings using the fixed UUID
  const SETTINGS_UUID = 'ed4ebb8c-40cd-4173-b492-fef97713217b';
  const { data: settings, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', SETTINGS_UUID)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const cookieStore = req.cookies;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // Auth check
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const body = await req.json();
  // Always update the row with the fixed UUID
  const SETTINGS_UUID = 'ed4ebb8c-40cd-4173-b492-fef97713217b';
  const { data: settings, error: fetchError } = await supabase
    .from('settings')
    .select('id')
    .eq('id', SETTINGS_UUID)
    .single();
  if (fetchError || !settings) {
    return NextResponse.json({ error: `Settings row with id = ${SETTINGS_UUID} not found` }, { status: 500 });
  }
  // Update settings
  const { error } = await supabase
    .from('settings')
    .update({
      smtp_host: body.smtp_host,
      smtp_port: body.smtp_port,
      smtp_username: body.smtp_username,
      smtp_password: body.smtp_password,
      smtp_secure: body.smtp_secure,
      email_from: body.email_from,
      email_from_name: body.email_from_name,
      signup_confirmation_subject: body.signup_confirmation_subject,
      signup_confirmation_body: body.signup_confirmation_body,
      password_reset_subject: body.password_reset_subject,
      password_reset_body: body.password_reset_body,
      email_confirmation_enabled: body.email_confirmation_enabled,
    })
    .eq('id', SETTINGS_UUID);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 