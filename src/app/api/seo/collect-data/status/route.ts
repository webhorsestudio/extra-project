// API endpoint to check SEO data collection status
import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createSupabaseAdminClient()

    // Get latest monitoring data
    const { data: latestData } = await supabase
      .from('seo_monitoring_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    // Get data count
    const { count: dataCount } = await supabase
      .from('seo_monitoring_data')
      .select('*', { count: 'exact', head: true })

    // Get active alerts count
    const { count: alertsCount } = await supabase
      .from('seo_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    return NextResponse.json({
      success: true,
      status: {
        hasData: !!latestData,
        latestDataTimestamp: latestData?.timestamp || null,
        totalRecords: dataCount || 0,
        activeAlerts: alertsCount || 0,
        lastCollection: latestData?.timestamp || 'Never',
        dataAge: latestData ? 
          Math.round((Date.now() - new Date(latestData.timestamp).getTime()) / (1000 * 60)) : 
          null // minutes ago
      }
    })
  } catch (error) {
    console.error('Error checking SEO data status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check SEO data status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
