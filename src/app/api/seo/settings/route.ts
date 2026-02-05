import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createSupabaseAdminClient()

    // Fetch all SEO settings
    const { data: settings, error } = await supabase
      .from('seo_settings')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      console.error('Error fetching SEO settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch SEO settings' },
        { status: 500 }
      )
    }

    // Group settings by category
    const groupedSettings = settings?.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    }, {} as Record<string, Record<string, unknown>[]>) || {}

    return NextResponse.json({ success: true, data: groupedSettings })
  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SEO settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createSupabaseAdminClient()

    // Update multiple settings
    const updates = Object.entries(body).map(([key, value]) => ({
      setting_key: key,
      setting_value: String(value),
    }))

    const results = []
    for (const update of updates) {
      const { error } = await supabase
        .from('seo_settings')
        .upsert(update, { onConflict: 'setting_key' })

      if (error) {
        console.error(`Error updating setting ${update.setting_key}:`, error)
        results.push({ key: update.setting_key, success: false, error: error.message })
      } else {
        results.push({ key: update.setting_key, success: true })
      }
    }

    const hasErrors = results.some(r => !r.success)
    
    return NextResponse.json({
      success: !hasErrors,
      message: hasErrors ? 'Some settings failed to update' : 'All settings updated successfully',
      results,
    })
  } catch (error) {
    console.error('Error updating SEO settings:', error)
    return NextResponse.json(
      { error: 'Failed to update SEO settings' },
      { status: 500 }
    )
  }
}
