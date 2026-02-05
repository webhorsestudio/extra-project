import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createSupabaseAdminClient()

    // Fetch recent monitoring data
    const { data: monitoringData, error: monitoringError } = await supabase
      .from('seo_monitoring_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(30)

    if (monitoringError) {
      console.error('Error fetching monitoring data:', monitoringError)
    }

    // Fetch recent alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('seo_alerts')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10)

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError)
    }

    // Fetch keyword rankings
    const { data: keywords, error: keywordsError } = await supabase
      .from('seo_keyword_rankings')
      .select('*')
      .order('date', { ascending: false })
      .limit(20)

    if (keywordsError) {
      console.error('Error fetching keywords:', keywordsError)
    }

    // Calculate real total pages count
    const totalPages = await countRealWebsitePages()

    // Calculate overview metrics
    const latestMonitoring = monitoringData?.[0]
    const indexedPages = latestMonitoring?.indexed_pages || 0
    const organicTraffic = latestMonitoring?.organic_traffic || 0
    const domainAuthority = latestMonitoring?.domain_authority || 0

    // Calculate average ranking
    const averageRanking = keywords?.length 
      ? keywords.reduce((sum, k) => sum + (k.position || 0), 0) / keywords.length
      : 0

    // Performance metrics - use sample data if no monitoring data exists
    const performance = {
      pageSpeed: latestMonitoring?.page_speed_desktop || 92,
      mobileUsability: latestMonitoring?.page_speed_mobile || 78,
      coreWebVitals: {
        lcp: latestMonitoring?.lcp || 2.1,
        fid: latestMonitoring?.fid || 45,
        cls: latestMonitoring?.cls || 0.05,
      }
    }

    // Top performing pages (mock for now - would need page analytics)
    const topPerformingPages = [
      { url: '/', title: 'Home Page', views: 1250, ranking: 1 },
      { url: '/properties', title: 'Properties', views: 890, ranking: 2 },
      { url: '/about', title: 'About Us', views: 650, ranking: 3 },
    ]

    // Top keywords
    const topKeywords = keywords?.slice(0, 10).map(k => ({
      keyword: k.keyword,
      position: k.position || 0,
      traffic: k.search_volume || 0,
    })) || []

    // Issues from alerts
    const issues = alerts?.map(alert => ({
      type: alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info',
      message: alert.message,
      url: alert.url,
      priority: alert.severity as 'high' | 'medium' | 'low',
    })) || []

    // Calculate SEO Score based on various factors
    const seoScore = calculateSEOScore({
      totalPages,
      indexedPages,
      organicTraffic,
      domainAuthority,
      performance,
      issues,
      keywords: keywords?.length || 0,
    })

    const dashboardData = {
      overview: {
        totalPages,
        indexedPages,
        organicTraffic,
        averageRanking: Math.round(averageRanking * 100) / 100,
        domainAuthority,
        seoScore,
      },
      performance,
      content: {
        topPerformingPages,
        topKeywords,
      },
      issues,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, data: dashboardData })
  } catch (error) {
    console.error('Error generating SEO dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to generate dashboard data' },
      { status: 500 }
    )
  }
}

// Function to count real website pages (excluding admin pages)
async function countRealWebsitePages(): Promise<number> {
  try {
    const supabase = await createSupabaseAdminClient()
    let totalPages = 0

    // 1. Count static pages (excluding admin pages)
    const staticPages = [
      '/',                    // Home page
      '/web',                 // Web home
      '/m',                   // Mobile home
      '/properties',          // Properties listing
      '/web/properties',      // Web properties
      '/m/properties',        // Mobile properties
      '/public-listings',     // Public listings
      '/m/public-listings',   // Mobile public listings
      '/blogs',               // Blogs listing
      '/web/blogs',           // Web blogs
      '/m/blogs',             // Mobile blogs
      '/contact',             // Contact page
      '/web/contact',         // Web contact
      '/m/contact',           // Mobile contact
      '/web/more',            // Web more page
      '/terms',               // Terms page
      '/m/terms',             // Mobile terms
      '/privacy',             // Privacy page
      '/m/privacy',           // Mobile privacy
      '/faqs',                // FAQs page
      '/m/faqs',              // Mobile FAQs
      '/support',             // Support page
      '/m/support',           // Mobile support
      '/wishlist',            // Wishlist page
      '/m/wishlist',          // Mobile wishlist
      '/seller-registration', // Seller registration
      '/users/login',         // Login page
      '/users/register',      // Register page
      '/users/forgot-password', // Forgot password
      '/users/confirm-email',   // Confirm email
      '/users/reset-password',  // Reset password
      '/profile',             // Profile page
      '/m/profile',           // Mobile profile
      '/notifications',       // Notifications
      '/m/notifications',     // Mobile notifications
      '/customer/dashboard',  // Customer dashboard
      '/agent/dashboard',     // Agent dashboard
      '/properties/add',      // Add property
      '/more',                // More page
    ]
    totalPages += staticPages.length

    // 2. Count dynamic property pages
    const { count: propertyCount, error: propertyError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (!propertyError && propertyCount) {
      totalPages += propertyCount
    }

    // 3. Count public listing pages
    const { count: publicListingCount, error: publicListingError } = await supabase
      .from('public_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (!publicListingError && publicListingCount) {
      totalPages += publicListingCount
    }

    // 4. Count blog pages
    const { count: blogCount, error: blogError } = await supabase
      .from('blogs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    if (!blogError && blogCount) {
      totalPages += blogCount
    }

    // 5. Count policy pages (dynamic)
    const { count: policyCount, error: policyError } = await supabase
      .from('policies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (!policyError && policyCount) {
      totalPages += policyCount
    }

    return totalPages
  } catch (error) {
    console.error('Error counting website pages:', error)
    // Return a reasonable fallback count
    return 50 // Conservative estimate
  }
}

// Function to calculate SEO Score based on various factors
function calculateSEOScore({
  totalPages,
  indexedPages,
  organicTraffic,
  domainAuthority,
  performance,
  issues,
  keywords
}: {
  totalPages: number
  indexedPages: number
  organicTraffic: number
  domainAuthority: number
  performance: Record<string, unknown>
  issues: Record<string, unknown>[]
  keywords: number
}): { score: number; grade: string; breakdown: Record<string, unknown> } {
  let score = 0
  const breakdown: Record<string, unknown> = {}

  // 1. Indexing Rate (25 points max)
  const indexingRate = totalPages > 0 ? (indexedPages / totalPages) * 100 : 0
  const indexingScore = Math.min(25, (indexingRate / 100) * 25)
  score += indexingScore
  breakdown.indexing = {
    rate: Math.round(indexingRate),
    score: Math.round(indexingScore),
    max: 25
  }

  // 2. Domain Authority (20 points max)
  const daScore = Math.min(20, (domainAuthority / 100) * 20)
  score += daScore
  breakdown.domainAuthority = {
    value: domainAuthority,
    score: Math.round(daScore),
    max: 20
  }

  // 3. Performance (20 points max)
  const coreWebVitals = performance.coreWebVitals as Record<string, unknown>
  const lcp = (coreWebVitals.lcp as number) || 0
  const fid = (coreWebVitals.fid as number) || 0
  const cls = (coreWebVitals.cls as number) || 0
  
  const lcpScore = lcp <= 2.5 ? 7 : lcp <= 4.0 ? 4 : 0
  const fidScore = fid <= 100 ? 7 : fid <= 300 ? 4 : 0
  const clsScore = cls <= 0.1 ? 6 : cls <= 0.25 ? 3 : 0
  const performanceScore = lcpScore + fidScore + clsScore
  score += performanceScore
  breakdown.performance = {
    lcp: { value: lcp, score: lcpScore, max: 7 },
    fid: { value: fid, score: fidScore, max: 7 },
    cls: { value: cls, score: clsScore, max: 6 },
    total: performanceScore,
    max: 20
  }

  // 4. Organic Traffic (15 points max)
  const trafficScore = organicTraffic > 10000 ? 15 : organicTraffic > 5000 ? 12 : organicTraffic > 1000 ? 8 : organicTraffic > 100 ? 5 : 0
  score += trafficScore
  breakdown.traffic = {
    value: organicTraffic,
    score: trafficScore,
    max: 15
  }

  // 5. Keyword Rankings (10 points max)
  const keywordScore = keywords > 50 ? 10 : keywords > 20 ? 7 : keywords > 10 ? 5 : keywords > 0 ? 3 : 0
  score += keywordScore
  breakdown.keywords = {
    count: keywords,
    score: keywordScore,
    max: 10
  }

  // 6. Issues Penalty (10 points max penalty)
  const criticalIssues = issues.filter(i => (i.priority as string) === 'high').length
  const warningIssues = issues.filter(i => (i.priority as string) === 'medium').length
  const issuePenalty = Math.min(10, (criticalIssues * 3) + (warningIssues * 1))
  score -= issuePenalty
  breakdown.issues = {
    critical: criticalIssues,
    warnings: warningIssues,
    penalty: issuePenalty,
    max: 10
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)))

  // Determine grade
  let grade = 'F'
  if (score >= 90) grade = 'A+'
  else if (score >= 80) grade = 'A'
  else if (score >= 70) grade = 'B'
  else if (score >= 60) grade = 'C'
  else if (score >= 50) grade = 'D'

  return {
    score,
    grade,
    breakdown
  }
}
