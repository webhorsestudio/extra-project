/**
 * SEO monitoring and reporting utilities
 */

import { createSupabaseClient } from '@/lib/supabase/client'

/**
 * SEO monitoring data interface
 */
export interface SEOMonitoringData {
  url: string
  timestamp: string
  metrics: {
    pageViews: number
    uniqueVisitors: number
    bounceRate: number
    averageSessionDuration: number
    organicTraffic: number
    keywordRankings: Array<{
      keyword: string
      position: number
      searchEngine: string
    }>
    backlinks: number
    domainAuthority: number
    pageSpeed: {
      mobile: number
      desktop: number
    }
    coreWebVitals: {
      lcp: number
      fid: number
      cls: number
      fcp: number
      ttfb: number
    }
    crawlErrors: number
    indexedPages: number
  }
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    message: string
    priority: 'high' | 'medium' | 'low'
    category: string
  }>
}

/**
 * SEO report interface
 */
export interface SEOReport {
  period: {
    start: string
    end: string
  }
  summary: {
    overallScore: number
    trend: 'up' | 'down' | 'stable'
    keyMetrics: {
      organicTraffic: number
      averageRanking: number
      domainAuthority: number
      pageSpeed: number
    }
  }
  performance: {
    topPages: Array<{
      url: string
      title: string
      views: number
      ranking: number
    }>
    topKeywords: Array<{
      keyword: string
      position: number
      traffic: number
      trend: 'up' | 'down' | 'stable'
    }>
    worstPerformingPages: Array<{
      url: string
      title: string
      issues: number
      score: number
    }>
  }
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    category: string
    message: string
    affectedPages: number
    priority: 'high' | 'medium' | 'low'
  }>
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    category: string
    recommendation: string
    expectedImpact: string
    effort: 'low' | 'medium' | 'high'
  }>
}

/**
 * Store SEO monitoring data
 */
export async function storeSEOMonitoringData(data: SEOMonitoringData): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    
    const { error } = await supabase
      .from('seo_monitoring')
      .insert({
        url: data.url,
        timestamp: data.timestamp,
        metrics: data.metrics,
        issues: data.issues,
      })

    if (error) {
      console.error('Error storing SEO monitoring data:', error)
      throw error
    }
  } catch (error) {
    console.error('Error storing SEO monitoring data:', error)
    throw error
  }
}

/**
 * Get SEO monitoring data for a specific period
 */
export async function getSEOMonitoringData(
  url: string,
  startDate: string,
  endDate: string
): Promise<SEOMonitoringData[]> {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('seo_monitoring')
      .select('*')
      .eq('url', url)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Error fetching SEO monitoring data:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error fetching SEO monitoring data:', error)
    return []
  }
}

/**
 * Generate SEO report for a specific period
 */
export async function generateSEOReport(
  startDate: string,
  endDate: string
): Promise<SEOReport> {
  try {
    const supabase = createSupabaseClient()
    
    // Get monitoring data for the period
    const { data: monitoringData, error } = await supabase
      .from('seo_monitoring')
      .select('*')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Error fetching monitoring data:', error)
      throw error
    }

    // Get previous period data for comparison
    const previousStartDate = new Date(startDate)
    previousStartDate.setMonth(previousStartDate.getMonth() - 1)
    const previousEndDate = new Date(endDate)
    previousEndDate.setMonth(previousEndDate.getMonth() - 1)

    const { data: previousData } = await supabase
      .from('seo_monitoring')
      .select('*')
      .gte('timestamp', previousStartDate.toISOString())
      .lte('timestamp', previousEndDate.toISOString())

    // Calculate summary metrics
    const currentMetrics = calculateAverageMetrics(monitoringData || [])
    const previousMetrics = calculateAverageMetrics(previousData || [])
    
    const overallScore = calculateOverallScore(currentMetrics)
    const trend = calculateTrend(currentMetrics, previousMetrics)

    // Get top performing pages
    const topPages = getTopPerformingPages(monitoringData || [])
    
    // Get top keywords
    const topKeywords = getTopKeywords(monitoringData || [])
    
    // Get worst performing pages
    const worstPages = getWorstPerformingPages(monitoringData || [])
    
    // Identify issues
    const issues = identifyIssues(monitoringData || [])
    
    // Generate recommendations
    const recommendations = generateRecommendations(currentMetrics, issues)

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      summary: {
        overallScore,
        trend,
        keyMetrics: {
          organicTraffic: currentMetrics.organicTraffic,
          averageRanking: currentMetrics.averageRanking,
          domainAuthority: currentMetrics.domainAuthority,
          pageSpeed: currentMetrics.pageSpeed,
        },
      },
      performance: {
        topPages,
        topKeywords,
        worstPerformingPages: worstPages,
      },
      issues,
      recommendations,
    }
  } catch (error) {
    console.error('Error generating SEO report:', error)
    throw error
  }
}

/**
 * Calculate average metrics from monitoring data
 */
function calculateAverageMetrics(data: Record<string, unknown>[]): {
  organicTraffic: number
  averageRanking: number
  domainAuthority: number
  pageSpeed: number
  bounceRate: number
  averageSessionDuration: number
} {
  if (data.length === 0) {
    return {
      organicTraffic: 0,
      averageRanking: 0,
      domainAuthority: 0,
      pageSpeed: 0,
      bounceRate: 0,
      averageSessionDuration: 0,
    }
  }

  const totals = data.reduce((acc, item) => {
    const metrics = item.metrics as Record<string, unknown>
    return {
      organicTraffic: (acc.organicTraffic as number) + ((metrics.organicTraffic as number) || 0),
      averageRanking: (acc.averageRanking as number) + ((metrics.keywordRankings as Record<string, unknown>[])?.reduce((sum: number, kw: Record<string, unknown>) => sum + (kw.position as number), 0) / ((metrics.keywordRankings as Record<string, unknown>[])?.length || 1) || 0),
      domainAuthority: (acc.domainAuthority as number) + ((metrics.domainAuthority as number) || 0),
      pageSpeed: (acc.pageSpeed as number) + ((((metrics.pageSpeed as Record<string, unknown>)?.mobile as number || 0) + ((metrics.pageSpeed as Record<string, unknown>)?.desktop as number || 0)) / 2),
      bounceRate: (acc.bounceRate as number) + ((metrics.bounceRate as number) || 0),
      averageSessionDuration: (acc.averageSessionDuration as number) + ((metrics.averageSessionDuration as number) || 0),
    }
  }, {
    organicTraffic: 0,
    averageRanking: 0,
    domainAuthority: 0,
    pageSpeed: 0,
    bounceRate: 0,
    averageSessionDuration: 0,
  })

  return {
    organicTraffic: Number(totals.organicTraffic) / data.length,
    averageRanking: Number(totals.averageRanking) / data.length,
    domainAuthority: Number(totals.domainAuthority) / data.length,
    pageSpeed: Number(totals.pageSpeed) / data.length,
    bounceRate: Number(totals.bounceRate) / data.length,
    averageSessionDuration: Number(totals.averageSessionDuration) / data.length,
  }
}

/**
 * Calculate overall SEO score
 */
function calculateOverallScore(metrics: Record<string, unknown>): number {
  let score = 0
  
  // Organic traffic (25%)
  const organicTraffic = Number(metrics.organicTraffic)
  if (organicTraffic > 1000) score += 25
  else if (organicTraffic > 500) score += 20
  else if (organicTraffic > 100) score += 15
  else if (organicTraffic > 50) score += 10
  
  // Average ranking (25%)
  const averageRanking = Number(metrics.averageRanking)
  if (averageRanking < 5) score += 25
  else if (averageRanking < 10) score += 20
  else if (averageRanking < 20) score += 15
  else if (averageRanking < 50) score += 10
  
  // Domain authority (20%)
  const domainAuthority = Number(metrics.domainAuthority)
  if (domainAuthority > 70) score += 20
  else if (domainAuthority > 50) score += 15
  else if (domainAuthority > 30) score += 10
  else if (domainAuthority > 20) score += 5
  
  // Page speed (15%)
  const pageSpeed = Number(metrics.pageSpeed)
  if (pageSpeed > 90) score += 15
  else if (pageSpeed > 80) score += 12
  else if (pageSpeed > 70) score += 8
  else if (pageSpeed > 60) score += 5
  
  // Bounce rate (10%)
  const bounceRate = Number(metrics.bounceRate)
  if (bounceRate < 30) score += 10
  else if (bounceRate < 40) score += 8
  else if (bounceRate < 50) score += 5
  else if (bounceRate < 60) score += 3
  
  // Session duration (5%)
  const averageSessionDuration = Number(metrics.averageSessionDuration)
  if (averageSessionDuration > 180) score += 5
  else if (averageSessionDuration > 120) score += 4
  else if (averageSessionDuration > 60) score += 3
  else if (averageSessionDuration > 30) score += 2
  
  return Math.round(score)
}

/**
 * Calculate trend between current and previous metrics
 */
function calculateTrend(current: Record<string, unknown>, previous: Record<string, unknown>): 'up' | 'down' | 'stable' {
  const currentScore = calculateOverallScore(current)
  const previousScore = calculateOverallScore(previous)
  
  const difference = currentScore - previousScore
  
  if (difference > 5) return 'up'
  if (difference < -5) return 'down'
  return 'stable'
}

/**
 * Get top performing pages
 */
function getTopPerformingPages(data: Record<string, unknown>[]): Array<{
  url: string
  title: string
  views: number
  ranking: number
}> {
  const pagePerformance: Record<string, {
    url: string
    views: number
    ranking: number
  }> = {}

  data.forEach(item => {
    const url = String(item.url)
    if (!pagePerformance[url]) {
      pagePerformance[url] = {
        url,
        views: 0,
        ranking: 0,
      }
    }
    
    const metrics = item.metrics as Record<string, unknown>
    pagePerformance[url].views += Number(metrics.pageViews) || 0
    pagePerformance[url].ranking = (metrics.keywordRankings as Record<string, unknown>[])?.reduce((sum: number, kw: Record<string, unknown>) => sum + Number(kw.position), 0) / ((metrics.keywordRankings as Record<string, unknown>[])?.length || 1) || 0
  })

  return Object.values(pagePerformance)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map(page => ({
      url: page.url,
      title: page.url.split('/').pop() || page.url,
      views: page.views,
      ranking: page.ranking,
    }))
}

/**
 * Get top keywords
 */
function getTopKeywords(data: Record<string, unknown>[]): Array<{
  keyword: string
  position: number
  traffic: number
  trend: 'up' | 'down' | 'stable'
}> {
  const keywordPerformance: Record<string, {
    keyword: string
    positions: number[]
    traffic: number
  }> = {}

  data.forEach(item => {
    const metrics = item.metrics as Record<string, unknown>
    const keywords = (metrics.keywordRankings as Record<string, unknown>[]) || []
    keywords.forEach((kw: Record<string, unknown>) => {
      const keyword = String(kw.keyword)
      if (!keywordPerformance[keyword]) {
        keywordPerformance[keyword] = {
          keyword,
          positions: [],
          traffic: 0,
        }
      }
      
      keywordPerformance[keyword].positions.push(Number(kw.position))
      keywordPerformance[keyword].traffic += Number(metrics.organicTraffic) || 0
    })
  })

  return Object.values(keywordPerformance)
    .map(kw => ({
      keyword: kw.keyword,
      position: kw.positions.reduce((sum, pos) => sum + pos, 0) / kw.positions.length,
      traffic: kw.traffic,
      trend: 'stable' as const, // Simplified for now
    }))
    .sort((a, b) => a.position - b.position)
    .slice(0, 10)
}

/**
 * Get worst performing pages
 */
function getWorstPerformingPages(data: Record<string, unknown>[]): Array<{
  url: string
  title: string
  issues: number
  score: number
}> {
  const pageIssues: Record<string, {
    url: string
    issues: number
    score: number
  }> = {}

  data.forEach(item => {
    const url = String(item.url)
    if (!pageIssues[url]) {
      pageIssues[url] = {
        url,
        issues: 0,
        score: 100,
      }
    }
    
    pageIssues[url].issues += (item.issues as unknown[])?.length || 0
    pageIssues[url].score = Math.min(pageIssues[url].score, calculateOverallScore(item.metrics as Record<string, unknown>))
  })

  return Object.values(pageIssues)
    .sort((a, b) => b.issues - a.issues)
    .slice(0, 10)
    .map(page => ({
      url: page.url,
      title: page.url.split('/').pop() || page.url,
      issues: page.issues,
      score: page.score,
    }))
}

/**
 * Identify SEO issues
 */
function identifyIssues(data: Record<string, unknown>[]): Array<{
  type: 'error' | 'warning' | 'info'
  category: string
  message: string
  affectedPages: number
  priority: 'high' | 'medium' | 'low'
}> {
  const issues: Record<string, {
    type: 'error' | 'warning' | 'info'
    category: string
    message: string
    affectedPages: number
    priority: 'high' | 'medium' | 'low'
  }> = {}

  data.forEach(item => {
    const itemIssues = (item.issues as Record<string, unknown>[]) || []
    itemIssues.forEach((issue: Record<string, unknown>) => {
      const key = `${issue.category}-${issue.message}`
      if (!issues[key]) {
        issues[key] = {
          type: issue.type as 'error' | 'warning' | 'info',
          category: String(issue.category),
          message: String(issue.message),
          affectedPages: 0,
          priority: issue.priority as 'high' | 'medium' | 'low',
        }
      }
      issues[key].affectedPages++
    })
  })

  return Object.values(issues)
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
}

/**
 * Generate recommendations based on metrics and issues
 */
function generateRecommendations(
  metrics: Record<string, unknown>,
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    category: string
    message: string
    affectedPages: number
    priority: 'high' | 'medium' | 'low'
  }>
): Array<{
  priority: 'high' | 'medium' | 'low'
  category: string
  recommendation: string
  expectedImpact: string
  effort: 'low' | 'medium' | 'high'
}> {
  const recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    category: string
    recommendation: string
    expectedImpact: string
    effort: 'low' | 'medium' | 'high'
  }> = []

  // High priority issues
  const highPriorityIssues = issues.filter(issue => issue.priority === 'high')
  highPriorityIssues.forEach(issue => {
    recommendations.push({
      priority: 'high',
      category: issue.category,
      recommendation: `Fix ${issue.message.toLowerCase()}`,
      expectedImpact: 'High impact on search rankings',
      effort: 'medium',
    })
  })

  // Performance recommendations
  const pageSpeed = Number(metrics.pageSpeed)
  if (pageSpeed < 70) {
    recommendations.push({
      priority: 'high',
      category: 'Performance',
      recommendation: 'Optimize page loading speed',
      expectedImpact: 'High impact on user experience and rankings',
      effort: 'high',
    })
  }

  const organicTraffic = Number(metrics.organicTraffic)
  if (organicTraffic < 100) {
    recommendations.push({
      priority: 'high',
      category: 'Content',
      recommendation: 'Improve content quality and keyword targeting',
      expectedImpact: 'High impact on organic traffic',
      effort: 'high',
    })
  }

  const averageRanking = Number(metrics.averageRanking)
  if (averageRanking > 20) {
    recommendations.push({
      priority: 'medium',
      category: 'SEO',
      recommendation: 'Improve keyword rankings through better optimization',
      expectedImpact: 'Medium impact on search visibility',
      effort: 'medium',
    })
  }

  const bounceRate = Number(metrics.bounceRate)
  if (bounceRate > 60) {
    recommendations.push({
      priority: 'medium',
      category: 'User Experience',
      recommendation: 'Improve content quality and user experience',
      expectedImpact: 'Medium impact on user engagement',
      effort: 'medium',
    })
  }

  return recommendations
}

/**
 * Set up SEO monitoring alerts
 */
export async function setupSEOAlerts(
  alerts: Array<{
    type: 'keyword_drop' | 'traffic_drop' | 'ranking_drop' | 'error_increase'
    threshold: number
    email: string
    enabled: boolean
  }>
): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    
    const { error } = await supabase
      .from('seo_alerts')
      .upsert(alerts.map(alert => ({
        type: alert.type,
        threshold: alert.threshold,
        email: alert.email,
        enabled: alert.enabled,
        created_at: new Date().toISOString(),
      })))

    if (error) {
      console.error('Error setting up SEO alerts:', error)
      throw error
    }
  } catch (error) {
    console.error('Error setting up SEO alerts:', error)
    throw error
  }
}

/**
 * Check for SEO alerts
 */
export async function checkSEOAlerts(): Promise<void> {
  try {
    const supabase = createSupabaseClient()
    
    // Get enabled alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('seo_alerts')
      .select('*')
      .eq('enabled', true)

    if (alertsError) {
      console.error('Error fetching SEO alerts:', alertsError)
      return
    }

    // Get recent monitoring data
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { data: recentData, error: dataError } = await supabase
      .from('seo_monitoring')
      .select('*')
      .gte('timestamp', yesterday.toISOString())

    if (dataError) {
      console.error('Error fetching recent monitoring data:', dataError)
      return
    }

    // Check each alert
    for (const alert of alerts || []) {
      const triggered = checkAlertCondition(alert, recentData || [])
      
      if (triggered) {
        // Send alert notification
        await sendAlertNotification(alert, recentData || [])
      }
    }
  } catch (error) {
    console.error('Error checking SEO alerts:', error)
  }
}

/**
 * Check if alert condition is met
 */
function checkAlertCondition(
  alert: Record<string, unknown>,
  data: Record<string, unknown>[]
): boolean {
  // Simplified alert checking logic
  // In production, you'd implement more sophisticated logic
  
  switch (alert.type) {
    case 'traffic_drop':
      const currentTraffic = data.reduce((sum, item) => {
        const metrics = item.metrics as Record<string, unknown>
        return sum + (Number(metrics.organicTraffic) || 0)
      }, 0)
      return currentTraffic < Number(alert.threshold)
    
    case 'ranking_drop':
      const currentRanking = data.reduce((sum, item) => {
        const metrics = item.metrics as Record<string, unknown>
        const rankings = (metrics.keywordRankings as Record<string, unknown>[]) || []
        const avgRanking = rankings.reduce((s: number, kw: Record<string, unknown>) => s + Number(kw.position), 0) / (rankings.length || 1)
        return sum + avgRanking
      }, 0) / (data.length || 1)
      return currentRanking > Number(alert.threshold)
    
    default:
      return false
  }
}

/**
 * Send alert notification
 */
async function sendAlertNotification(alert: Record<string, unknown>, data: Record<string, unknown>[]): Promise<void> {
  // In production, you'd implement email/SMS notification
  console.log(`SEO Alert: ${alert.type} threshold exceeded`, {
    alert,
    data: data.length,
  })
}
