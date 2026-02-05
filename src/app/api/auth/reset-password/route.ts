import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: () => undefined } }
  );

  // Find the token
  const { data: resetToken, error: tokenError } = await supabase
    .from('password_reset_tokens')
    .select('id, user_id, expires_at, used')
    .eq('token', token)
    .single();
  if (tokenError || !resetToken) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
  if (resetToken.used) {
    return NextResponse.json({ error: 'Token already used' }, { status: 400 });
  }
  if (new Date(resetToken.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 400 });
  }

  // Update the user's password (using service role client)
  const { createSupabaseAdminClient } = await import('@/lib/supabase/admin');
  const adminSupabase = await createSupabaseAdminClient();
  const { error: updateError } = await adminSupabase.auth.admin.updateUserById(resetToken.user_id, {
    password
  });
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Mark token as used
  await supabase
    .from('password_reset_tokens')
    .update({ used: true })
    .eq('id', resetToken.id);

  return NextResponse.json({ success: true });
} 