import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { reportType, period } = await request.json()
    
    const supabase = await createSupabaseAdminClient()

    // Fetch data for the report
    const [monitoringData, , alerts, keywords] = await Promise.all([
      supabase
        .from('seo_monitoring_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(30),
      supabase
        .from('seo_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('seo_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('seo_keyword_rankings')
        .select('*')
        .order('date', { ascending: false })
        .limit(50)
    ])

    // Calculate metrics
    const latestMonitoring = monitoringData.data?.[0]
    const totalPages = monitoringData.data?.length || 0
    const indexedPages = latestMonitoring?.indexed_pages || 0
    const organicTraffic = latestMonitoring?.organic_traffic || 0
    const domainAuthority = latestMonitoring?.domain_authority || 0

    // Calculate SEO Score
    const indexingRate = totalPages > 0 ? (indexedPages / totalPages) * 100 : 0
    const seoScore = Math.round(
      (indexingRate * 0.25) + 
      (domainAuthority * 0.2) + 
      (Math.min(organicTraffic / 1000, 15)) + 
      (keywords.data?.length || 0) * 0.2
    )

    // Generate report data
    const reportData = {
      title: 'SEO Performance Report',
      generatedAt: new Date().toISOString(),
      period: period || '30days',
      reportType: reportType || 'comprehensive',
      
      // Overview Metrics
      overview: {
        totalPages,
        indexedPages,
        organicTraffic,
        domainAuthority,
        seoScore,
        indexingRate: Math.round(indexingRate)
      },
      
      // Performance Data
      performance: {
        lcp: latestMonitoring?.lcp || 0,
        fid: latestMonitoring?.fid || 0,
        cls: latestMonitoring?.cls || 0,
        pageSpeed: latestMonitoring?.page_speed_desktop || 0
      },
      
      // Issues
      issues: alerts.data?.map(alert => ({
        type: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        url: alert.url
      })) || [],
      
      // Keywords
      keywords: keywords.data?.slice(0, 20).map(k => ({
        keyword: k.keyword,
        position: k.position,
        searchVolume: k.search_volume,
        difficulty: k.difficulty
      })) || [],
      
      // Recommendations
      recommendations: generateRecommendations({
        seoScore,
        indexingRate,
        issues: alerts.data || [],
        performance: latestMonitoring
      })
    }

    // Store the report in the database
    const { data: savedReport, error: saveError } = await supabase
      .from('seo_reports')
      .insert({
        report_type: 'comprehensive',
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString(),
        overall_score: seoScore,
        total_issues: (alerts.data || []).length,
        critical_issues: (alerts.data || []).filter(i => i.severity === 'critical').length,
        warnings: (alerts.data || []).filter(i => i.severity === 'high').length,
        recommendations: reportData.recommendations,
        metrics: reportData.overview,
        issues: reportData.issues,
        status: 'completed'
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving report:', saveError)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...reportData,
        reportId: savedReport?.id,
        savedAt: new Date().toISOString()
      },
      message: 'Report generated and saved successfully'
    })

  } catch (error) {
    console.error('Error generating SEO report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

function generateRecommendations({
  seoScore,
  indexingRate,
  issues,
  performance
}: {
  seoScore: number
  indexingRate: number
  issues: Record<string, unknown>[]
  performance: Record<string, unknown>
}): string[] {
  const recommendations: string[] = []

  if (seoScore < 70) {
    recommendations.push('Focus on improving overall SEO performance')
  }

  if (indexingRate < 80) {
    recommendations.push('Improve page indexing rate by submitting sitemap and fixing crawl errors')
  }

  if ((performance?.lcp as number) > 2.5) {
    recommendations.push('Optimize Largest Contentful Paint (LCP) for better performance')
  }

  if ((performance?.fid as number) > 100) {
    recommendations.push('Reduce First Input Delay (FID) to improve interactivity')
  }

  if ((performance?.cls as number) > 0.1) {
    recommendations.push('Fix Cumulative Layout Shift (CLS) issues')
  }

  const criticalIssues = issues.filter(i => i.severity === 'critical').length
  if (criticalIssues > 0) {
    recommendations.push(`Address ${criticalIssues} critical SEO issues immediately`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring and optimizing for sustained growth')
  }

  return recommendations
}
