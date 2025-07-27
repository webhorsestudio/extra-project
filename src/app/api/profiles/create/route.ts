import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const { id, full_name } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const supabase = await createSupabaseAdminClient();
    const { error } = await supabase
      .from('profiles')
      .insert({
        id,
        full_name: full_name || '',
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    if (error) {
      console.error('Profile creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile creation exception:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 