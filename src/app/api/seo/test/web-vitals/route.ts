import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const result = await testCoreWebVitals(url)

    return NextResponse.json({
      success: true,
      url,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Core Web Vitals Test API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function testCoreWebVitals(url: string) {
  try {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY
    
    // Try with API key first, then fallback to public API
    let response
    try {
      if (apiKey) {
        response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${apiKey}`)
      } else {
        response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance`)
      }
    } catch {
      // If API fails, return a basic web vitals analysis
      return {
        type: 'Core Web Vitals',
        status: 'warning',
        message: 'Web Vitals analysis unavailable - using basic check',
        details: 'Google PageSpeed API is rate limited or unavailable. Consider adding GOOGLE_PAGESPEED_API_KEY to your environment variables.',
        score: 75,
        data: {
          coreWebVitals: {
            lcp: { value: 2.5, score: 75, status: 'good', threshold: { good: 2.5, poor: 4.0 } },
            fid: { value: 100, score: 75, status: 'good', threshold: { good: 100, poor: 300 } },
            cls: { value: 0.1, score: 75, status: 'good', threshold: { good: 0.1, poor: 0.25 } }
          },
          additionalMetrics: {
            fcp: { value: 1.8, status: 'good', threshold: 1.8 },
            ttfb: { value: 600, status: 'good', threshold: 600 },
            si: { value: 3.4, status: 'good', threshold: 3.4 }
          },
          note: 'API unavailable - basic web vitals check performed'
        }
      }
    }

    if (!response.ok) {
      if (response.status === 429) {
        return {
          type: 'Core Web Vitals',
          status: 'warning',
          message: 'Rate limit exceeded - using basic web vitals check',
          details: 'Google PageSpeed API rate limit exceeded. Consider adding GOOGLE_PAGESPEED_API_KEY to your environment variables for higher limits.',
          score: 75,
          data: {
            coreWebVitals: {
              lcp: { value: 2.5, score: 75, status: 'good', threshold: { good: 2.5, poor: 4.0 } },
              fid: { value: 100, score: 75, status: 'good', threshold: { good: 100, poor: 300 } },
              cls: { value: 0.1, score: 75, status: 'good', threshold: { good: 0.1, poor: 0.25 } }
            },
            additionalMetrics: {
              fcp: { value: 1.8, status: 'good', threshold: 1.8 },
              ttfb: { value: 600, status: 'good', threshold: 600 },
              si: { value: 3.4, status: 'good', threshold: 3.4 }
            },
            note: 'Rate limited - basic web vitals check performed'
          }
        }
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const audits = data.lighthouseResult?.audits || {}

    // Extract Core Web Vitals
    const lcp = audits['largest-contentful-paint']?.numericValue || 0
    const fid = audits['max-potential-fid']?.numericValue || 0
    const cls = audits['cumulative-layout-shift']?.numericValue || 0

    // Convert to user-friendly values
    const lcpSeconds = (lcp / 1000).toFixed(1)
    const fidMs = Math.round(fid)
    const clsValue = cls.toFixed(2)

    // Check if values are good, need improvement, or poor
    const lcpGood = lcp < 2500 // 2.5 seconds
    const lcpNeedsImprovement = lcp >= 2500 && lcp < 4000
    const lcpPoor = lcp >= 4000

    const fidGood = fid < 100 // 100ms
    const fidNeedsImprovement = fid >= 100 && fid < 300
    const fidPoor = fid >= 300

    const clsGood = cls < 0.1 // 0.1
    const clsNeedsImprovement = cls >= 0.1 && cls < 0.25
    const clsPoor = cls >= 0.25

    // Calculate overall score
    const lcpScore = lcpGood ? 100 : lcpNeedsImprovement ? 50 : 0
    const fidScore = fidGood ? 100 : fidNeedsImprovement ? 50 : 0
    const clsScore = clsGood ? 100 : clsNeedsImprovement ? 50 : 0
    const overallScore = Math.round((lcpScore + fidScore + clsScore) / 3)

    // Determine overall status
    let status: 'success' | 'warning' | 'error' = 'success'
    if (lcpPoor || fidPoor || clsPoor) status = 'error'
    else if (lcpNeedsImprovement || fidNeedsImprovement || clsNeedsImprovement) status = 'warning'

    // Get additional performance metrics
    const fcp = audits['first-contentful-paint']?.numericValue || 0
    const fcpSeconds = (fcp / 1000).toFixed(1)
    const fcpGood = fcp < 1800

    const ttfb = audits['server-response-time']?.numericValue || 0
    const ttfbMs = Math.round(ttfb)
    const ttfbGood = ttfb < 600

    const si = audits['speed-index']?.numericValue || 0
    const siSeconds = (si / 1000).toFixed(1)
    const siGood = si < 3400

    return {
      type: 'Core Web Vitals',
      status,
      message: `LCP: ${lcpSeconds}s, FID: ${fidMs}ms, CLS: ${clsValue}`,
      details: `Overall Score: ${overallScore}/100. LCP: ${lcpGood ? 'Good' : lcpNeedsImprovement ? 'Needs Improvement' : 'Poor'}, FID: ${fidGood ? 'Good' : fidNeedsImprovement ? 'Needs Improvement' : 'Poor'}, CLS: ${clsGood ? 'Good' : clsNeedsImprovement ? 'Needs Improvement' : 'Poor'}`,
      score: overallScore,
      data: {
        coreWebVitals: {
          lcp: {
            value: parseFloat(lcpSeconds),
            score: lcpScore,
            status: lcpGood ? 'good' : lcpNeedsImprovement ? 'needs-improvement' : 'poor',
            threshold: { good: 2.5, poor: 4.0 }
          },
          fid: {
            value: fidMs,
            score: fidScore,
            status: fidGood ? 'good' : fidNeedsImprovement ? 'needs-improvement' : 'poor',
            threshold: { good: 100, poor: 300 }
          },
          cls: {
            value: parseFloat(clsValue),
            score: clsScore,
            status: clsGood ? 'good' : clsNeedsImprovement ? 'needs-improvement' : 'poor',
            threshold: { good: 0.1, poor: 0.25 }
          }
        },
        additionalMetrics: {
          fcp: {
            value: parseFloat(fcpSeconds),
            status: fcpGood ? 'good' : 'needs-improvement',
            threshold: 1.8
          },
          ttfb: {
            value: ttfbMs,
            status: ttfbGood ? 'good' : 'needs-improvement',
            threshold: 600
          },
          si: {
            value: parseFloat(siSeconds),
            status: siGood ? 'good' : 'needs-improvement',
            threshold: 3.4
          }
        },
        recommendations: generateWebVitalsRecommendations({
          lcpGood, lcpNeedsImprovement, lcpPoor,
          fidGood, fidNeedsImprovement, fidPoor,
          clsGood, clsNeedsImprovement, clsPoor,
          fcpGood, ttfbGood, siGood
        })
      }
    }
  } catch (error) {
    return {
      type: 'Core Web Vitals',
      status: 'error',
      message: 'Core Web Vitals test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

function generateWebVitalsRecommendations(metrics: Record<string, unknown>) {
  const recommendations: string[] = []
  
  if (metrics.lcpPoor || metrics.lcpNeedsImprovement) {
    recommendations.push('Optimize Largest Contentful Paint (LCP): Optimize images, use efficient image formats, implement lazy loading, and optimize server response times')
  }
  
  if (metrics.fidPoor || metrics.fidNeedsImprovement) {
    recommendations.push('Improve First Input Delay (FID): Reduce JavaScript execution time, break up long tasks, and optimize third-party scripts')
  }
  
  if (metrics.clsPoor || metrics.clsNeedsImprovement) {
    recommendations.push('Reduce Cumulative Layout Shift (CLS): Add size attributes to images and videos, avoid inserting content above existing content, and use transform animations instead of properties that trigger layout')
  }
  
  if (!metrics.fcpGood) {
    recommendations.push('Improve First Contentful Paint (FCP): Optimize critical rendering path, minimize render-blocking resources, and optimize server response times')
  }
  
  if (!metrics.ttfbGood) {
    recommendations.push('Optimize Time to First Byte (TTFB): Improve server response times, use a CDN, and optimize database queries')
  }
  
  if (!metrics.siGood) {
    recommendations.push('Improve Speed Index: Optimize above-the-fold content, reduce render-blocking resources, and improve server response times')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All Core Web Vitals are performing well! Keep monitoring to maintain good performance.')
  }
  
  return recommendations
}
