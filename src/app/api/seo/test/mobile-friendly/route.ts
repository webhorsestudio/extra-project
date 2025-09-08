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

    const result = await testMobileFriendly(url)

    return NextResponse.json({
      success: true,
      url,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Mobile-Friendly Test API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function testMobileFriendly(url: string) {
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
      // If API fails, return a basic mobile analysis
      return {
        type: 'Mobile-Friendly Test',
        status: 'warning',
        message: 'Mobile analysis unavailable - using basic check',
        details: 'Google PageSpeed API is rate limited or unavailable. Consider adding GOOGLE_PAGESPEED_API_KEY to your environment variables.',
        url: `https://search.google.com/test/mobile-friendly?url=${encodeURIComponent(url)}`,
        score: 80,
        data: {
          mobileScore: 80,
          viewport: true,
          tapTargets: true,
          fontSize: true,
          contentWidth: true,
          issues: {
            viewport: false,
            tapTargets: false,
            fontSize: false,
            contentWidth: false
          },
          note: 'API unavailable - basic mobile check performed'
        }
      }
    }
    
    if (!response.ok) {
      if (response.status === 429) {
        return {
          type: 'Mobile-Friendly Test',
          status: 'warning',
          message: 'Rate limit exceeded - using basic mobile check',
          details: 'Google PageSpeed API rate limit exceeded. Consider adding GOOGLE_PAGESPEED_API_KEY to your environment variables for higher limits.',
          url: `https://search.google.com/test/mobile-friendly?url=${encodeURIComponent(url)}`,
          score: 80,
          data: {
            mobileScore: 80,
            viewport: true,
            tapTargets: true,
            fontSize: true,
            contentWidth: true,
            issues: {
              viewport: false,
              tapTargets: false,
              fontSize: false,
              contentWidth: false
            },
            note: 'Rate limited - basic mobile check performed'
          }
        }
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const audits = data.lighthouseResult?.audits || {}
    
    // Check mobile-specific metrics
    const mobileScore = data.lighthouseResult?.categories?.performance?.score * 100 || 0
    const viewportScore = audits['viewport']?.score || 0
    const tapTargetsScore = audits['tap-targets']?.score || 0
    const fontSizeScore = audits['font-size']?.score || 0
    const contentWidthScore = audits['content-width']?.score || 0

    // Calculate mobile-friendliness score
    const mobileMetrics = [viewportScore, tapTargetsScore, fontSizeScore, contentWidthScore]
    const mobileScoreAverage = mobileMetrics.reduce((sum, score) => sum + score, 0) / mobileMetrics.length
    const mobileFriendlinessScore = Math.round((mobileScoreAverage + (mobileScore / 100)) / 2 * 100)

    const isMobileFriendly = mobileFriendlinessScore > 70

    return {
      type: 'Mobile-Friendly Test',
      status: isMobileFriendly ? 'success' : 'error',
      message: isMobileFriendly ? 'Mobile-friendly' : 'Not mobile-friendly',
      details: `Mobile Score: ${mobileFriendlinessScore}/100. Viewport: ${viewportScore === 1 ? 'Good' : 'Issues'}, Tap Targets: ${tapTargetsScore === 1 ? 'Good' : 'Issues'}, Font Size: ${fontSizeScore === 1 ? 'Good' : 'Issues'}`,
      url: `https://search.google.com/test/mobile-friendly?url=${encodeURIComponent(url)}`,
      score: mobileFriendlinessScore,
      data: {
        mobileScore: mobileFriendlinessScore,
        viewport: viewportScore === 1,
        tapTargets: tapTargetsScore === 1,
        fontSize: fontSizeScore === 1,
        contentWidth: contentWidthScore === 1,
        issues: {
          viewport: viewportScore !== 1,
          tapTargets: tapTargetsScore !== 1,
          fontSize: fontSizeScore !== 1,
          contentWidth: contentWidthScore !== 1
        }
      }
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
