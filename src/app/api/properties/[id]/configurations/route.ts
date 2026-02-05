import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }
    const supabase = await createSupabaseAdminClient();
    const { data: configurations, error } = await supabase
      .from('property_configurations')
      .select('*')
      .eq('property_id', propertyId)
      .order('bhk', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!configurations || configurations.length === 0) {
      return NextResponse.json({ error: 'No configurations found' }, { status: 404 });
    }
    return NextResponse.json({ configurations });
  } catch {}
} 