/**
 * SEO analytics and tracking utilities
 */

/**
 * SEO metrics interface
 */
export interface SEOMetrics {
  pageViews: number
  uniqueVisitors: number
  bounceRate: number
  averageSessionDuration: number
  organicTraffic: number
  keywordRankings: Array<{
    keyword: string
    position: number
    url: string
    date: string
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
}

/**
 * SEO tracking events
 */
export interface SEOTrackingEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  customParameters?: Record<string, unknown>
}

/**
 * Generate Google Analytics 4 configuration
 */
export function generateGA4Config(
  measurementId: string,
  customConfig?: {
    enhancedEcommerce?: boolean
    customDimensions?: Array<{
      index: number
      name: string
      scope: 'EVENT' | 'USER' | 'SESSION'
    }>
    customMetrics?: Array<{
      index: number
      name: string
      scope: 'EVENT' | 'USER' | 'SESSION'
    }>
  }
): string {
  const config = {
    measurement_id: measurementId,
    enhanced_ecommerce: customConfig?.enhancedEcommerce || false,
    custom_map: {
      ...customConfig?.customDimensions?.reduce((acc, dim) => ({
        ...acc,
        [`custom_parameter_${dim.index}`]: dim.name
      }), {}),
      ...customConfig?.customMetrics?.reduce((acc, metric) => ({
        ...acc,
        [`custom_parameter_${metric.index}`]: metric.name
      }), {})
    }
  }

  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', ${JSON.stringify(config, null, 2)});
  `
}

/**
 * Generate Google Search Console verification
 */
export function generateGSCVerification(verificationCode: string): string {
  return `
    <meta name="google-site-verification" content="${verificationCode}" />
  `
}

/**
 * Generate Google Tag Manager configuration
 */
export function generateGTMConfig(containerId: string): string {
  return `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${containerId}');
  `
}

/**
 * Track SEO events
 */
// Declare gtag function for Google Analytics and dataLayer for GTM
declare global {
  function gtag(...args: unknown[]): void
  const dataLayer: unknown[]
}

export function trackSEOEvent(event: SEOTrackingEvent): void {
  // Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.customParameters
    })
  }

  // Google Tag Manager
  if (typeof dataLayer !== 'undefined') {
    dataLayer.push({
      event: event.event,
      event_category: event.category,
      event_action: event.action,
      event_label: event.label,
      value: event.value,
      ...event.customParameters
    })
  }

  // Custom analytics endpoint
  fetch('/api/analytics/seo-events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...event,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    }),
  }).catch(console.error)
}

/**
 * Track page performance
 */
export function trackPagePerformance(metrics: {
  loadTime: number
  domContentLoaded: number
  firstPaint: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
}): void {
  trackSEOEvent({
    event: 'page_performance',
    category: 'Performance',
    action: 'page_load',
    label: window.location.pathname,
    value: metrics.loadTime,
    customParameters: {
      dom_content_loaded: metrics.domContentLoaded,
      first_paint: metrics.firstPaint,
      first_contentful_paint: metrics.firstContentfulPaint,
      largest_contentful_paint: metrics.largestContentfulPaint,
      first_input_delay: metrics.firstInputDelay,
      cumulative_layout_shift: metrics.cumulativeLayoutShift,
    }
  })
}

/**
 * Track search engine visibility
 */
export function trackSearchEngineVisibility(metrics: {
  indexedPages: number
  crawlErrors: number
  mobileUsability: number
  pageSpeed: number
  securityIssues: number
}): void {
  trackSEOEvent({
    event: 'search_engine_visibility',
    category: 'SEO',
    action: 'visibility_check',
    customParameters: {
      indexed_pages: metrics.indexedPages,
      crawl_errors: metrics.crawlErrors,
      mobile_usability: metrics.mobileUsability,
      page_speed: metrics.pageSpeed,
      security_issues: metrics.securityIssues,
    }
  })
}

/**
 * Track keyword rankings
 */
export function trackKeywordRankings(rankings: Array<{
  keyword: string
  position: number
  url: string
  searchEngine: 'google' | 'bing' | 'yahoo'
}>): void {
  rankings.forEach(ranking => {
    trackSEOEvent({
      event: 'keyword_ranking',
      category: 'SEO',
      action: 'ranking_update',
      label: ranking.keyword,
      value: ranking.position,
      customParameters: {
        url: ranking.url,
        search_engine: ranking.searchEngine,
        keyword: ranking.keyword,
      }
    })
  })
}

/**
 * Track backlink acquisition
 */
export function trackBacklinkAcquisition(backlink: {
  source: string
  target: string
  anchorText: string
  domainAuthority: number
  linkType: 'dofollow' | 'nofollow'
}): void {
  trackSEOEvent({
    event: 'backlink_acquisition',
    category: 'SEO',
    action: 'backlink_gained',
    label: backlink.source,
    customParameters: {
      target_url: backlink.target,
      anchor_text: backlink.anchorText,
      domain_authority: backlink.domainAuthority,
      link_type: backlink.linkType,
    }
  })
}

/**
 * Track content performance
 */
export function trackContentPerformance(content: {
  type: 'property' | 'blog' | 'public_listing'
  id: string
  title: string
  views: number
  shares: number
  timeOnPage: number
  bounceRate: number
}): void {
  trackSEOEvent({
    event: 'content_performance',
    category: 'Content',
    action: 'performance_update',
    label: content.title,
    value: content.views,
    customParameters: {
      content_type: content.type,
      content_id: content.id,
      shares: content.shares,
      time_on_page: content.timeOnPage,
      bounce_rate: content.bounceRate,
    }
  })
}

/**
 * Generate SEO dashboard data
 */
export async function generateSEODashboardData(): Promise<{
  overview: {
    totalPages: number
    indexedPages: number
    organicTraffic: number
    averageRanking: number
    domainAuthority: number
  }
  performance: {
    pageSpeed: number
    mobileUsability: number
    coreWebVitals: {
      lcp: number
      fid: number
      cls: number
    }
  }
  content: {
    topPerformingPages: Array<{
      url: string
      title: string
      views: number
      ranking: number
    }>
    topKeywords: Array<{
      keyword: string
      position: number
      traffic: number
    }>
  }
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    message: string
    url?: string
    priority: 'high' | 'medium' | 'low'
  }>
}> {
  // This would typically fetch data from your analytics APIs
  // For now, returning mock data structure
  return {
    overview: {
      totalPages: 0,
      indexedPages: 0,
      organicTraffic: 0,
      averageRanking: 0,
      domainAuthority: 0,
    },
    performance: {
      pageSpeed: 0,
      mobileUsability: 0,
      coreWebVitals: {
        lcp: 0,
        fid: 0,
        cls: 0,
      },
    },
    content: {
      topPerformingPages: [],
      topKeywords: [],
    },
    issues: [],
  }
}

/**
 * Generate SEO report
 */
export function generateSEOReport(metrics: SEOMetrics): {
  summary: string
  recommendations: string[]
  priority: 'high' | 'medium' | 'low'
  score: number
} {
  let score = 0
  const recommendations: string[] = []

  // Calculate overall SEO score
  if (metrics.organicTraffic > 1000) score += 20
  else if (metrics.organicTraffic > 500) score += 15
  else if (metrics.organicTraffic > 100) score += 10

  if (metrics.domainAuthority > 50) score += 20
  else if (metrics.domainAuthority > 30) score += 15
  else if (metrics.domainAuthority > 20) score += 10

  if (metrics.pageSpeed.mobile > 90) score += 15
  else if (metrics.pageSpeed.mobile > 70) score += 10
  else if (metrics.pageSpeed.mobile > 50) score += 5

  if (metrics.coreWebVitals.lcp < 2500) score += 15
  else if (metrics.coreWebVitals.lcp < 4000) score += 10
  else score += 5

  if (metrics.coreWebVitals.cls < 0.1) score += 15
  else if (metrics.coreWebVitals.cls < 0.25) score += 10
  else score += 5

  if (metrics.bounceRate < 40) score += 15
  else if (metrics.bounceRate < 60) score += 10
  else score += 5

  // Generate recommendations based on metrics
  if (metrics.organicTraffic < 100) {
    recommendations.push('Focus on content marketing and keyword optimization to increase organic traffic')
  }

  if (metrics.domainAuthority < 30) {
    recommendations.push('Build high-quality backlinks to improve domain authority')
  }

  if (metrics.pageSpeed.mobile < 70) {
    recommendations.push('Optimize page speed for mobile devices to improve user experience')
  }

  if (metrics.coreWebVitals.lcp > 4000) {
    recommendations.push('Optimize Largest Contentful Paint by improving server response time and image loading')
  }

  if (metrics.coreWebVitals.cls > 0.25) {
    recommendations.push('Fix layout shift issues by reserving space for images and avoiding dynamic content injection')
  }

  if (metrics.bounceRate > 60) {
    recommendations.push('Improve content quality and user experience to reduce bounce rate')
  }

  const priority = score < 40 ? 'high' : score < 70 ? 'medium' : 'low'
  
  const summary = `SEO Score: ${score}/100. ${
    score >= 80 ? 'Excellent SEO performance!' :
    score >= 60 ? 'Good SEO performance with room for improvement.' :
    score >= 40 ? 'Fair SEO performance, several areas need attention.' :
    'Poor SEO performance, immediate action required.'
  }`

  return {
    summary,
    recommendations,
    priority,
    score,
  }
}

/**
 * Track SEO goal completions
 */
export function trackSEOGoal(goal: {
  name: string
  value: number
  category: string
  parameters?: Record<string, unknown>
}): void {
  trackSEOEvent({
    event: 'seo_goal_completion',
    category: 'SEO Goals',
    action: goal.name,
    value: goal.value,
    customParameters: {
      goal_category: goal.category,
      ...goal.parameters,
    }
  })
}
