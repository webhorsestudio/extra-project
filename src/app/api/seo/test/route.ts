import { NextRequest, NextResponse } from 'next/server'

interface SEOTestRequest {
  url: string
  tests: string[]
}

interface SEOTestResult {
  type: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: string
  url?: string
  score?: number
  data?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const { url, tests }: SEOTestRequest = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    if (!tests || tests.length === 0) {
      return NextResponse.json(
        { error: 'At least one test type is required' },
        { status: 400 }
      )
    }

    const results: SEOTestResult[] = []

    // Run tests in parallel
    const testPromises = tests.map(async (testType) => {
      try {
        switch (testType) {
          case 'rich-results':
            return await testRichResults(url)
          case 'pagespeed':
            return await testPageSpeed(url)
          case 'mobile-friendly':
            return await testMobileFriendly(url)
          case 'structured-data':
            return await testStructuredData(url)
          case 'meta-tags':
            return await testMetaTags(url)
          case 'web-vitals':
            return await testCoreWebVitals(url)
          default:
            return {
              type: testType,
              status: 'error' as const,
              message: 'Unknown test type',
              details: `Test type "${testType}" is not supported`
            }
        }
      } catch (error) {
        return {
          type: testType,
          status: 'error' as const,
          message: 'Test failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    const testResults = await Promise.all(testPromises)
    results.push(...testResults)

    return NextResponse.json({
      success: true,
      url,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('SEO Test API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Google Rich Results Test
async function testRichResults(url: string): Promise<SEOTestResult> {
  try {
    // Use Google's Rich Results Test API
    const response = await fetch(`https://search.google.com/test/rich-results/api/validate?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Test-Bot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.overallResult && data.overallResult.verdict === 'PASS') {
      return {
        type: 'Rich Results Test',
        status: 'success',
        message: 'Rich results detected',
        details: `Found ${data.overallResult.verdict} with ${data.overallResult.totalTests} tests`,
        url: `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`,
        data: data.overallResult
      }
    } else {
      return {
        type: 'Rich Results Test',
        status: 'warning',
        message: 'No rich results found or issues detected',
        details: data.overallResult ? `Status: ${data.overallResult.verdict}` : 'No structured data detected',
        url: `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`,
        data: data.overallResult
      }
    }
  } catch (error) {
    return {
      type: 'Rich Results Test',
      status: 'error',
      message: 'Rich results test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      url: `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`
    }
  }
}

// Google PageSpeed Insights API
async function testPageSpeed(url: string): Promise<SEOTestResult> {
  try {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY
    const response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo${apiKey ? `&key=${apiKey}` : ''}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const performanceScore = data.lighthouseResult?.categories?.performance?.score * 100 || 0
    const seoScore = data.lighthouseResult?.categories?.seo?.score * 100 || 0
    const accessibilityScore = data.lighthouseResult?.categories?.accessibility?.score * 100 || 0
    const bestPracticesScore = data.lighthouseResult?.categories?.['best-practices']?.score * 100 || 0

    const overallScore = Math.round((performanceScore + seoScore + accessibilityScore + bestPracticesScore) / 4)

    let status: 'success' | 'warning' | 'error' = 'success'
    if (overallScore < 50) status = 'error'
    else if (overallScore < 80) status = 'warning'

    return {
      type: 'PageSpeed Insights',
      status,
      message: `Performance Score: ${overallScore}/100`,
      details: `Performance: ${Math.round(performanceScore)}, SEO: ${Math.round(seoScore)}, Accessibility: ${Math.round(accessibilityScore)}, Best Practices: ${Math.round(bestPracticesScore)}`,
      url: `https://pagespeed.web.dev/report?url=${encodeURIComponent(url)}`,
      score: overallScore,
      data: {
        performance: Math.round(performanceScore),
        seo: Math.round(seoScore),
        accessibility: Math.round(accessibilityScore),
        bestPractices: Math.round(bestPracticesScore)
      }
    }
  } catch (error) {
    return {
      type: 'PageSpeed Insights',
      status: 'error',
      message: 'PageSpeed test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      url: `https://pagespeed.web.dev/report?url=${encodeURIComponent(url)}`
    }
  }
}

// Google Mobile-Friendly Test
async function testMobileFriendly(url: string): Promise<SEOTestResult> {
  try {
    // Use Google's Mobile-Friendly Test API
    const response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const mobileScore = data.lighthouseResult?.categories?.performance?.score * 100 || 0
    
    // Check for mobile-specific issues
    const mobileIssues = data.lighthouseResult?.audits?.['viewport']?.score === 1 ? 0 : 1
    const isMobileFriendly = mobileScore > 50 && mobileIssues === 0

    return {
      type: 'Mobile-Friendly Test',
      status: isMobileFriendly ? 'success' : 'error',
      message: isMobileFriendly ? 'Mobile-friendly' : 'Not mobile-friendly',
      details: isMobileFriendly ? 'Page is optimized for mobile devices' : 'Page needs mobile optimization',
      url: `https://search.google.com/test/mobile-friendly?url=${encodeURIComponent(url)}`,
      score: Math.round(mobileScore),
      data: { mobileScore: Math.round(mobileScore), mobileIssues }
    }
  } catch (error) {
    return {
      type: 'Mobile-Friendly Test',
      status: 'error',
      message: 'Mobile-friendly test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      url: `https://search.google.com/test/mobile-friendly?url=${encodeURIComponent(url)}`
    }
  }
}

// Structured Data Validation
async function testStructuredData(url: string): Promise<SEOTestResult> {
  try {
    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Test-Bot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    
    // Look for structured data
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)
    const microdataMatches = html.match(/itemscope|itemtype|itemprop/g)
    const rdfaMatches = html.match(/typeof|property|vocab/g)

    const hasJsonLd = jsonLdMatches && jsonLdMatches.length > 0
    const hasMicrodata = microdataMatches && microdataMatches.length > 0
    const hasRdfa = rdfaMatches && rdfaMatches.length > 0

    const hasStructuredData = hasJsonLd || hasMicrodata || hasRdfa

    if (hasStructuredData) {
      return {
        type: 'Structured Data',
        status: 'success',
        message: 'Structured data found',
        details: `JSON-LD: ${hasJsonLd ? 'Yes' : 'No'}, Microdata: ${hasMicrodata ? 'Yes' : 'No'}, RDFa: ${hasRdfa ? 'Yes' : 'No'}`,
        url: `https://validator.schema.org/#url=${encodeURIComponent(url)}`,
        data: { jsonLd: hasJsonLd, microdata: hasMicrodata, rdfa: hasRdfa }
      }
    } else {
      return {
        type: 'Structured Data',
        status: 'warning',
        message: 'No structured data detected',
        details: 'Consider adding structured data for better SEO',
        url: `https://validator.schema.org/#url=${encodeURIComponent(url)}`,
        data: { jsonLd: false, microdata: false, rdfa: false }
      }
    }
  } catch (error) {
    return {
      type: 'Structured Data',
      status: 'error',
      message: 'Structured data test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      url: `https://validator.schema.org/#url=${encodeURIComponent(url)}`
    }
  }
}

// Meta Tags Analysis
async function testMetaTags(url: string): Promise<SEOTestResult> {
  try {
    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Test-Bot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    
    // Extract meta tags
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const ogDescriptionMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const twitterCardMatch = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["'][^>]*>/i)

    const hasTitle = !!titleMatch
    const hasDescription = !!descriptionMatch
    const hasKeywords = !!keywordsMatch
    const hasOgTitle = !!ogTitleMatch
    const hasOgDescription = !!ogDescriptionMatch
    const hasOgImage = !!ogImageMatch
    const hasTwitterCard = !!twitterCardMatch

    const essentialTags = [hasTitle, hasDescription]
    const socialTags = [hasOgTitle, hasOgDescription, hasOgImage, hasTwitterCard]
    
    const essentialScore = essentialTags.filter(Boolean).length / essentialTags.length
    const socialScore = socialTags.filter(Boolean).length / socialTags.length
    const overallScore = (essentialScore + socialScore) / 2

    let status: 'success' | 'warning' | 'error' = 'success'
    if (overallScore < 0.5) status = 'error'
    else if (overallScore < 0.8) status = 'warning'

    return {
      type: 'Meta Tags',
      status,
      message: hasTitle && hasDescription ? 'Meta tags present' : 'Missing essential meta tags',
      details: `Title: ${hasTitle ? 'Yes' : 'No'}, Description: ${hasDescription ? 'Yes' : 'No'}, Keywords: ${hasKeywords ? 'Yes' : 'No'}, Social: ${socialTags.filter(Boolean).length}/${socialTags.length}`,
      score: Math.round(overallScore * 100),
      data: {
        title: hasTitle,
        description: hasDescription,
        keywords: hasKeywords,
        ogTitle: hasOgTitle,
        ogDescription: hasOgDescription,
        ogImage: hasOgImage,
        twitterCard: hasTwitterCard
      }
    }
  } catch (error) {
    return {
      type: 'Meta Tags',
      status: 'error',
      message: 'Meta tags test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Core Web Vitals (using PageSpeed Insights data)
async function testCoreWebVitals(url: string): Promise<SEOTestResult> {
  try {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY
    const response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance${apiKey ? `&key=${apiKey}` : ''}`)

    if (!response.ok) {
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

    // Check if values are good
    const lcpGood = lcp < 2500 // 2.5 seconds
    const fidGood = fid < 100 // 100ms
    const clsGood = cls < 0.1 // 0.1

    const allGood = lcpGood && fidGood && clsGood
    const someGood = lcpGood || fidGood || clsGood

    let status: 'success' | 'warning' | 'error' = 'success'
    if (!someGood) status = 'error'
    else if (!allGood) status = 'warning'

    return {
      type: 'Core Web Vitals',
      status,
      message: `LCP: ${lcpSeconds}s, FID: ${fidMs}ms, CLS: ${clsValue}`,
      details: allGood ? 'All Core Web Vitals are good' : 'Some Core Web Vitals need improvement',
      data: {
        lcp: parseFloat(lcpSeconds),
        fid: fidMs,
        cls: parseFloat(clsValue),
        lcpGood,
        fidGood,
        clsGood
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
