// Cron job endpoint for automatic SEO data collection
import { NextRequest, NextResponse } from 'next/server'
import { seoMonitor } from '@/lib/seo/data-collection'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Cron job: Starting automatic SEO data collection...')
    
    // Run data collection
    await seoMonitor.runOnce()
    
    return NextResponse.json({
      success: true,
      message: 'Automatic SEO data collection completed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
