import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: () => undefined } }
  );

  // Find the token
  const { data: confirmToken, error: tokenError } = await supabase
    .from('email_confirmation_tokens')
    .select('id, user_id, expires_at, used')
    .eq('token', token)
    .single();
  if (tokenError || !confirmToken) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
  if (confirmToken.used) {
    return NextResponse.json({ error: 'Token already used' }, { status: 400 });
  }
  if (new Date(confirmToken.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 400 });
  }

  // Mark user as confirmed (update confirmed_at in auth.users)
  const { createSupabaseAdminClient } = await import('@/lib/supabase/admin');
  const adminSupabase = await createSupabaseAdminClient();
  const { error: updateError } = await adminSupabase.auth.admin.updateUserById(confirmToken.user_id, {
    email_confirm: true
  });
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Mark token as used
  await supabase
    .from('email_confirmation_tokens')
    .update({ used: true })
    .eq('id', confirmToken.id);

  return NextResponse.json({ success: true });
} 