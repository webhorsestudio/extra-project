import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseAdminClient()
  const { id } = params
  const { name, icon, is_active } = await req.json()
  const update: any = {}
  if (name !== undefined) update.name = name
  if (icon !== undefined) update.icon = icon
  if (is_active !== undefined) update.is_active = is_active
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('property_categories')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ category: data })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseAdminClient()
  const { id } = params
  const { error } = await supabase
    .from('property_categories')
    .delete()
    .eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
} 