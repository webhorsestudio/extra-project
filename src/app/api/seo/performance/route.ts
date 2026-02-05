import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    const url = searchParams.get('url')

    // Fetch performance data
    const performanceData = await fetchPerformanceData(supabase, period, url || undefined)

    return NextResponse.json({ success: true, data: performanceData })
  } catch (error) {
    console.error('Error fetching performance data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, metrics } = body

    if (!url || !metrics) {
      return NextResponse.json(
        { error: 'URL and metrics are required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseAdminClient()

    // Store performance metrics
    const { data, error } = await supabase
      .from('seo_monitoring_data')
      .insert({
        url: url,
        page_speed_desktop: metrics.pageSpeed?.desktop || 0,
        page_speed_mobile: metrics.pageSpeed?.mobile || 0,
        lcp: metrics.coreWebVitals?.lcp || 0,
        fid: metrics.coreWebVitals?.fid || 0,
        cls: metrics.coreWebVitals?.cls || 0,
        fcp: metrics.coreWebVitals?.fcp || 0,
        ttfb: metrics.coreWebVitals?.ttfb || 0,
        mobile_usability_score: metrics.mobileUsability || 0,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error storing performance data:', error)
      return NextResponse.json(
        { error: 'Failed to store performance data' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error storing performance data:', error)
    return NextResponse.json(
      { error: 'Failed to store performance data' },
      { status: 500 }
    )
  }
}

async function fetchPerformanceData(supabase: SupabaseClient, period: string, url?: string) {
  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(endDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(endDate.getDate() - 90)
      break
    default:
      startDate.setDate(endDate.getDate() - 30)
  }

  // Build query
  let query = supabase
    .from('seo_monitoring_data')
    .select('*')
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString())
    .order('timestamp', { ascending: false })

  if (url) {
    query = query.eq('url', url)
  }

  const { data: monitoringData, error } = await query

  if (error) {
    console.error('Error fetching monitoring data:', error)
    return getDefaultPerformanceData()
  }

  if (!monitoringData || monitoringData.length === 0) {
    return getDefaultPerformanceData()
  }

  // Process performance data
  const latest = monitoringData[0]
  const averages = calculateAverages(monitoringData)
  const trends = calculatePerformanceTrends(monitoringData, period)

  return {
    current: {
      pageSpeed: {
        desktop: latest.page_speed_desktop || 0,
        mobile: latest.page_speed_mobile || 0,
      },
      coreWebVitals: {
        lcp: latest.lcp || 0,
        fid: latest.fid || 0,
        cls: latest.cls || 0,
        fcp: latest.fcp || 0,
        ttfb: latest.ttfb || 0,
      },
      mobileUsability: latest.mobile_usability_score || 0,
    },
    averages,
    trends,
    scores: {
      overall: calculateOverallScore(latest),
      pageSpeed: calculatePageSpeedScore(latest),
      coreWebVitals: calculateCoreWebVitalsScore(latest),
      mobileUsability: calculateMobileUsabilityScore(latest),
    },
    recommendations: generatePerformanceRecommendations(latest),
    lastUpdated: latest.timestamp,
  }
}

function getDefaultPerformanceData() {
  return {
    current: {
      pageSpeed: { desktop: 0, mobile: 0 },
      coreWebVitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
      mobileUsability: 0,
    },
    averages: {
      pageSpeed: { desktop: 0, mobile: 0 },
      coreWebVitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
      mobileUsability: 0,
    },
    trends: {
      pageSpeed: [],
      coreWebVitals: [],
      mobileUsability: [],
    },
    scores: {
      overall: 0,
      pageSpeed: 0,
      coreWebVitals: 0,
      mobileUsability: 0,
    },
    recommendations: [],
    lastUpdated: new Date().toISOString(),
  }
}

function calculateAverages(data: Record<string, unknown>[]) {
  const validData = data.filter(d => (d.page_speed_desktop as number) > 0)
  
  if (validData.length === 0) {
    return {
      pageSpeed: { desktop: 0, mobile: 0 },
      coreWebVitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
      mobileUsability: 0,
    }
  }

  return {
    pageSpeed: {
      desktop: validData.reduce((sum, d) => sum + ((d.page_speed_desktop as number) || 0), 0) / validData.length,
      mobile: validData.reduce((sum, d) => sum + ((d.page_speed_mobile as number) || 0), 0) / validData.length,
    },
    coreWebVitals: {
      lcp: validData.reduce((sum, d) => sum + ((d.lcp as number) || 0), 0) / validData.length,
      fid: validData.reduce((sum, d) => sum + ((d.fid as number) || 0), 0) / validData.length,
      cls: validData.reduce((sum, d) => sum + ((d.cls as number) || 0), 0) / validData.length,
      fcp: validData.reduce((sum, d) => sum + ((d.fcp as number) || 0), 0) / validData.length,
      ttfb: validData.reduce((sum, d) => sum + ((d.ttfb as number) || 0), 0) / validData.length,
    },
    mobileUsability: validData.reduce((sum, d) => sum + ((d.mobile_usability_score as number) || 0), 0) / validData.length,
  }
}

function calculatePerformanceTrends(data: Record<string, unknown>[], period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const trends = {
    pageSpeed: [] as Record<string, unknown>[],
    coreWebVitals: [] as Record<string, unknown>[],
    mobileUsability: [] as Record<string, unknown>[],
  }

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayData = data.filter(d => {
      const dataDate = new Date(d.timestamp as string)
      return dataDate.toDateString() === date.toDateString()
    })

    if (dayData.length > 0) {
      const avg = calculateAverages(dayData)
      trends.pageSpeed.push({
        date: date.toISOString().split('T')[0],
        desktop: avg.pageSpeed.desktop,
        mobile: avg.pageSpeed.mobile,
      })
      trends.coreWebVitals.push({
        date: date.toISOString().split('T')[0],
        lcp: avg.coreWebVitals.lcp,
        fid: avg.coreWebVitals.fid,
        cls: avg.coreWebVitals.cls,
      })
      trends.mobileUsability.push({
        date: date.toISOString().split('T')[0],
        score: avg.mobileUsability,
      })
    }
  }

  return trends
}

function calculateOverallScore(data: Record<string, unknown>) {
  const pageSpeedScore = calculatePageSpeedScore(data)
  const coreWebVitalsScore = calculateCoreWebVitalsScore(data)
  const mobileUsabilityScore = calculateMobileUsabilityScore(data)
  
  return Math.round((pageSpeedScore + coreWebVitalsScore + mobileUsabilityScore) / 3)
}

function calculatePageSpeedScore(data: Record<string, unknown>) {
  const desktop = (data.page_speed_desktop as number) || 0
  const mobile = (data.page_speed_mobile as number) || 0
  
  if (desktop === 0 && mobile === 0) return 0
  
  const avg = (desktop + mobile) / 2
  if (avg >= 90) return 100
  if (avg >= 80) return 80
  if (avg >= 70) return 60
  if (avg >= 50) return 40
  return 20
}

function calculateCoreWebVitalsScore(data: Record<string, unknown>) {
  const lcp = (data.lcp as number) || 0
  const fid = (data.fid as number) || 0
  const cls = (data.cls as number) || 0
  
  if (lcp === 0 && fid === 0 && cls === 0) return 0
  
  let score = 0
  
  // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
  if (lcp <= 2.5) score += 40
  else if (lcp <= 4) score += 20
  else score += 0
  
  // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
  if (fid <= 100) score += 30
  else if (fid <= 300) score += 15
  else score += 0
  
  // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
  if (cls <= 0.1) score += 30
  else if (cls <= 0.25) score += 15
  else score += 0
  
  return score
}

function calculateMobileUsabilityScore(data: Record<string, unknown>) {
  const score = (data.mobile_usability_score as number) || 0
  return Math.round(score)
}

function generatePerformanceRecommendations(current: Record<string, unknown>) {
  const recommendations: Array<{
    type: 'error' | 'warning' | 'info'
    category: string
    message: string
    suggestion: string
    impact: 'high' | 'medium' | 'low'
  }> = []

  // Page Speed recommendations
  if ((current.page_speed_desktop as number) < 50) {
    recommendations.push({
      type: 'error',
      category: 'Page Speed',
      message: 'Desktop page speed is very slow',
      suggestion: 'Optimize images, minify CSS/JS, and enable compression',
      impact: 'high'
    })
  } else if ((current.page_speed_desktop as number) < 80) {
    recommendations.push({
      type: 'warning',
      category: 'Page Speed',
      message: 'Desktop page speed needs improvement',
      suggestion: 'Consider optimizing images and reducing server response time',
      impact: 'medium'
    })
  }

  if ((current.page_speed_mobile as number) < 50) {
    recommendations.push({
      type: 'error',
      category: 'Mobile Performance',
      message: 'Mobile page speed is very slow',
      suggestion: 'Optimize for mobile: reduce image sizes, minimize CSS/JS',
      impact: 'high'
    })
  }

  // Core Web Vitals recommendations
  if ((current.lcp as number) > 4) {
    recommendations.push({
      type: 'error',
      category: 'Core Web Vitals',
      message: 'Largest Contentful Paint is too slow',
      suggestion: 'Optimize images, improve server response time, and eliminate render-blocking resources',
      impact: 'high'
    })
  } else if ((current.lcp as number) > 2.5) {
    recommendations.push({
      type: 'warning',
      category: 'Core Web Vitals',
      message: 'Largest Contentful Paint needs improvement',
      suggestion: 'Consider optimizing images and reducing server response time',
      impact: 'medium'
    })
  }

  if ((current.fid as number) > 300) {
    recommendations.push({
      type: 'error',
      category: 'Core Web Vitals',
      message: 'First Input Delay is too high',
      suggestion: 'Reduce JavaScript execution time and break up long tasks',
      impact: 'high'
    })
  }

  if ((current.cls as number) > 0.25) {
    recommendations.push({
      type: 'error',
      category: 'Core Web Vitals',
      message: 'Cumulative Layout Shift is too high',
      suggestion: 'Add size attributes to images and avoid inserting content above existing content',
      impact: 'high'
    })
  }

  // Mobile Usability recommendations
  if ((current.mobile_usability_score as number) < 80) {
    recommendations.push({
      type: 'warning',
      category: 'Mobile Usability',
      message: 'Mobile usability score is low',
      suggestion: 'Ensure touch targets are large enough and text is readable without zooming',
      impact: 'medium'
    })
  }

  return recommendations
}
