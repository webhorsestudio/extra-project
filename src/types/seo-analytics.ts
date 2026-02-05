/**
 * SEO Analytics data types
 */

export interface SEOAnalyticsData {
  overview: {
    totalEvents: number
    totalSessions: number
    averageSessionDuration: number
    bounceRate: number
    conversionRate: number
  }
  traffic: {
    organic: number
    direct: number
    referral: number
    social: number
  }
  keywords: {
    totalKeywords: number
    topKeywords: Array<{
      keyword: string
      position: number
      searchVolume: number
      url: string
    }>
    rankingChanges: {
      improved: number
      declined: number
      stable: number
    }
    averagePosition: number
  }
  performance: {
    pageSpeed: {
      desktop: number
      mobile: number
    }
    coreWebVitals: {
      lcp: number
      fid: number
      cls: number
    }
    mobileUsability: number
  }
  trends: {
    trafficTrend: Array<{
      date: string
      value: number
    }>
    keywordTrend: Array<{
      keyword: string
      positions: Array<{
        date: string
        position: number
      }>
    }>
    performanceTrend: Array<{
      date: string
      pageSpeed: number
      lcp: number
      cls: number
    }>
  }
}
