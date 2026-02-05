// API endpoint to trigger SEO data collection
import { NextResponse } from 'next/server'
import { seoMonitor } from '@/lib/seo/data-collection'

export async function POST() {
  try {
    console.log('Starting SEO data collection...')
    
    // Run data collection
    await seoMonitor.runOnce()
    
    return NextResponse.json({
      success: true,
      message: 'SEO data collection completed successfully'
    })
  } catch (error) {
    console.error('Error in SEO data collection:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to collect SEO data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to trigger SEO data collection',
    endpoints: {
      collect: 'POST /api/seo/collect-data',
      status: 'GET /api/seo/collect-data/status'
    }
  })
}
