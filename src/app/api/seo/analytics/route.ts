import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    // const metric = searchParams.get('metric') || 'all'

    // Fetch analytics data from database
    const analyticsData = await fetchAnalyticsData(supabase, period)

    return NextResponse.json({ success: true, data: analyticsData })
  } catch (error) {
    console.error('Error fetching SEO analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

async function fetchAnalyticsData(supabase: SupabaseClient, period: string) {
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

  // Fetch SEO events
  const { data: events, error: eventsError } = await supabase
    .from('seo_events')
    .select('*')
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString())
    .order('timestamp', { ascending: false })

  if (eventsError) {
    console.error('Error fetching SEO events:', eventsError)
  }

  // Fetch monitoring data
  const { data: monitoringData, error: monitoringError } = await supabase
    .from('seo_monitoring_data')
    .select('*')
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString())
    .order('timestamp', { ascending: false })

  if (monitoringError) {
    console.error('Error fetching monitoring data:', monitoringError)
  }

  // Fetch keyword rankings
  const { data: keywords, error: keywordsError } = await supabase
    .from('seo_keyword_rankings')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: false })

  if (keywordsError) {
    console.error('Error fetching keyword rankings:', keywordsError)
  }

  // Process analytics data
  const analytics = {
    overview: {
      totalEvents: events?.length || 0,
      totalSessions: events?.filter(e => e.event === 'page_view').length || 0,
      averageSessionDuration: calculateAverageSessionDuration(events || []),
      bounceRate: calculateBounceRate(events || []),
      conversionRate: calculateConversionRate(events || []),
    },
    traffic: {
      organic: calculateOrganicTraffic(events || []),
      direct: calculateDirectTraffic(events || []),
      referral: calculateReferralTraffic(events || []),
      social: calculateSocialTraffic(events || []),
    },
    keywords: {
      totalKeywords: keywords?.length || 0,
      topKeywords: getTopKeywords(keywords || [], 10),
      rankingChanges: calculateRankingChanges(keywords || []),
      averagePosition: calculateAveragePosition(keywords || []),
    },
    performance: {
      pageSpeed: getLatestPageSpeed(monitoringData || []),
      coreWebVitals: getLatestCoreWebVitals(monitoringData || []),
      mobileUsability: getLatestMobileUsability(monitoringData || []),
    },
    trends: {
      trafficTrend: calculateTrafficTrend(events || [], period),
      keywordTrend: calculateKeywordTrend(keywords || []),
      performanceTrend: calculatePerformanceTrend(monitoringData || []),
    }
  }

  return analytics
}

function calculateAverageSessionDuration(events: Record<string, unknown>[]) {
  if (!events || events.length === 0) return 0
  
  const sessions = new Map()
  events.forEach(event => {
    if (event.event === 'page_view') {
      if (!sessions.has(event.session_id)) {
        sessions.set(event.session_id, { start: event.timestamp, end: event.timestamp })
      } else {
        const session = sessions.get(event.session_id)
        session.end = event.timestamp
      }
    }
  })

  const durations = Array.from(sessions.values()).map(session => {
    const start = new Date(session.start)
    const end = new Date(session.end)
    return (end.getTime() - start.getTime()) / 1000 // seconds
  })

  return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
}

function calculateBounceRate(events: Record<string, unknown>[]) {
  if (!events || events.length === 0) return 0
  
  const sessions = new Map()
  events.forEach(event => {
    if (event.event === 'page_view') {
      if (!sessions.has(event.session_id)) {
        sessions.set(event.session_id, 1)
      } else {
        sessions.set(event.session_id, sessions.get(event.session_id) + 1)
      }
    }
  })

  const singlePageSessions = Array.from(sessions.values()).filter(count => count === 1).length
  const totalSessions = sessions.size

  return totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0
}

function calculateConversionRate(events: Record<string, unknown>[]) {
  if (!events || events.length === 0) return 0
  
  const conversionEvents = events.filter(e => e.event === 'conversion').length
  const totalSessions = events.filter(e => e.event === 'page_view').length

  return totalSessions > 0 ? (conversionEvents / totalSessions) * 100 : 0
}

function calculateOrganicTraffic(events: Record<string, unknown>[]) {
  return events?.filter(e => e.referrer && (e.referrer as string).includes('google')).length || 0
}

function calculateDirectTraffic(events: Record<string, unknown>[]) {
  return events?.filter(e => !e.referrer || e.referrer === 'direct').length || 0
}

function calculateReferralTraffic(events: Record<string, unknown>[]) {
  return events?.filter(e => e.referrer && !(e.referrer as string).includes('google') && !(e.referrer as string).includes('facebook')).length || 0
}

function calculateSocialTraffic(events: Record<string, unknown>[]) {
  return events?.filter(e => e.referrer && ((e.referrer as string).includes('facebook') || (e.referrer as string).includes('twitter'))).length || 0
}

function getTopKeywords(keywords: Record<string, unknown>[], limit: number) {
  if (!keywords || keywords.length === 0) return []
  
  const keywordMap = new Map()
  keywords.forEach(k => {
    if (keywordMap.has(k.keyword)) {
      const existing = keywordMap.get(k.keyword)
      keywordMap.set(k.keyword, {
        ...existing,
        position: Math.min(existing.position, k.position as number),
        searchVolume: Math.max(existing.searchVolume, (k.search_volume as number) || 0)
      })
    } else {
      keywordMap.set(k.keyword, {
        keyword: k.keyword,
        position: k.position as number,
        searchVolume: (k.search_volume as number) || 0,
        url: k.url
      })
    }
  })

  return Array.from(keywordMap.values())
    .sort((a, b) => a.position - b.position)
    .slice(0, limit)
}

function calculateRankingChanges(keywords: Record<string, unknown>[]) {
  if (!keywords || keywords.length === 0) return { improved: 0, declined: 0, stable: 0 }
  
  const keywordChanges = new Map()
  keywords.forEach(k => {
    if (!keywordChanges.has(k.keyword)) {
      keywordChanges.set(k.keyword, [])
    }
    keywordChanges.get(k.keyword).push({ date: k.date, position: k.position })
  })

  let improved = 0, declined = 0, stable = 0

  keywordChanges.forEach(positions => {
    if (positions.length >= 2) {
      const latest = positions[0].position
      const previous = positions[1].position
      
      if (latest < previous) improved++
      else if (latest > previous) declined++
      else stable++
    }
  })

  return { improved, declined, stable }
}

function calculateAveragePosition(keywords: Record<string, unknown>[]) {
  if (!keywords || keywords.length === 0) return 0
  
  const validPositions = keywords.filter(k => k.position && (k.position as number) > 0)
  return validPositions.length > 0 
    ? validPositions.reduce((sum, k) => sum + (k.position as number), 0) / validPositions.length 
    : 0
}

function getLatestPageSpeed(monitoringData: Record<string, unknown>[]) {
  if (!monitoringData || monitoringData.length === 0) return { desktop: 0, mobile: 0 }
  
  const latest = monitoringData[0]
  return {
    desktop: latest.page_speed_desktop || 0,
    mobile: latest.page_speed_mobile || 0
  }
}

function getLatestCoreWebVitals(monitoringData: Record<string, unknown>[]) {
  if (!monitoringData || monitoringData.length === 0) return { lcp: 0, fid: 0, cls: 0 }
  
  const latest = monitoringData[0]
  return {
    lcp: latest.lcp || 0,
    fid: latest.fid || 0,
    cls: latest.cls || 0
  }
}

function getLatestMobileUsability(monitoringData: Record<string, unknown>[]) {
  if (!monitoringData || monitoringData.length === 0) return 0
  
  return monitoringData[0]?.mobile_usability_score || 0
}

function calculateTrafficTrend(events: Record<string, unknown>[], period: string) {
  // Simplified trend calculation
  if (!events || events.length === 0) return []
  
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const trend = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.timestamp as string)
      return eventDate.toDateString() === date.toDateString()
    })
    
    trend.push({
      date: date.toISOString().split('T')[0],
      value: dayEvents.length
    })
  }
  
  return trend
}

function calculateKeywordTrend(keywords: Record<string, unknown>[]) {
  // Simplified keyword trend
  if (!keywords || keywords.length === 0) return []
  
  const keywordMap = new Map()
  keywords.forEach(k => {
    if (!keywordMap.has(k.keyword)) {
      keywordMap.set(k.keyword, [])
    }
    keywordMap.get(k.keyword).push({ date: k.date, position: k.position })
  })
  
  return Array.from(keywordMap.entries()).slice(0, 5).map(([keyword, positions]) => ({
    keyword,
    positions: positions.slice(0, 7) // Last 7 data points
  }))
}

function calculatePerformanceTrend(monitoringData: Record<string, unknown>[]) {
  if (!monitoringData || monitoringData.length === 0) return []
  
  return monitoringData.slice(0, 7).map(data => ({
    date: (data.timestamp as string).split('T')[0],
    pageSpeed: data.page_speed_desktop || 0,
    lcp: data.lcp || 0,
    cls: data.cls || 0
  }))
}
