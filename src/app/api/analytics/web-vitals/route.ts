import { NextRequest, NextResponse } from 'next/server'
import { storeSEOMonitoringData } from '@/lib/seo/monitoring'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.value || !body.id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, value, id' },
        { status: 400 }
      )
    }

    // Store Web Vitals data
    const monitoringData = {
      url: body.url || request.headers.get('referer') || 'unknown',
      timestamp: new Date().toISOString(),
      metrics: {
        pageViews: 0,
        uniqueVisitors: 0,
        bounceRate: 0,
        averageSessionDuration: 0,
        organicTraffic: 0,
        keywordRankings: [],
        backlinks: 0,
        domainAuthority: 0,
        pageSpeed: {
          mobile: 0,
          desktop: 0,
        },
        coreWebVitals: {
          lcp: body.name === 'LCP' ? body.value : 0,
          fid: body.name === 'FID' ? body.value : 0,
          cls: body.name === 'CLS' ? body.value : 0,
          fcp: body.name === 'FCP' ? body.value : 0,
          ttfb: body.name === 'TTFB' ? body.value : 0,
        },
        crawlErrors: 0,
        indexedPages: 0,
      },
      issues: [],
    }

    await storeSEOMonitoringData(monitoringData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing Web Vitals data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
