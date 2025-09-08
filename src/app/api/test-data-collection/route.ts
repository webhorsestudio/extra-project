// Test endpoint for SEO data collection
import { NextResponse } from 'next/server'
import { seoMonitor } from '@/lib/seo/data-collection'

export async function GET() {
  try {
    console.log('Testing SEO data collection...')
    
    // Run data collection
    await seoMonitor.runOnce()
    
    return NextResponse.json({
      success: true,
      message: 'Test data collection completed successfully',
      timestamp: new Date().toISOString(),
      note: 'Check the seo_monitoring_data table in your database to see the collected data'
    })
  } catch (error) {
    console.error('Test data collection error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Test data collection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
