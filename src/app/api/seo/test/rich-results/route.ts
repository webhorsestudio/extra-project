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

    const result = await testRichResults(url)

    return NextResponse.json({
      success: true,
      url,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Rich Results Test API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function testRichResults(url: string) {
  try {
    // First, try to fetch the page and analyze structured data locally
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Test-Bot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    
    // Look for structured data patterns
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)
    const microdataMatches = html.match(/itemscope|itemtype|itemprop/g)
    const rdfaMatches = html.match(/typeof|property|vocab/g)
    const schemaOrgMatches = html.match(/schema\.org/g)

    const hasJsonLd = jsonLdMatches && jsonLdMatches.length > 0
    const hasMicrodata = microdataMatches && microdataMatches.length > 0
    const hasRdfa = rdfaMatches && rdfaMatches.length > 0
    const hasSchemaOrg = schemaOrgMatches && schemaOrgMatches.length > 0

    const hasStructuredData = hasJsonLd || hasMicrodata || hasRdfa || hasSchemaOrg

    // Count structured data instances
    const jsonLdCount = jsonLdMatches ? jsonLdMatches.length : 0
    const microdataCount = microdataMatches ? microdataMatches.length : 0
    const rdfaCount = rdfaMatches ? rdfaMatches.length : 0
    const totalStructuredData = jsonLdCount + microdataCount + rdfaCount

    if (hasStructuredData) {
      return {
        type: 'Rich Results Test',
        status: 'success',
        message: 'Structured data detected',
        details: `Found ${totalStructuredData} structured data elements: JSON-LD: ${jsonLdCount}, Microdata: ${microdataCount}, RDFa: ${rdfaCount}`,
        url: `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`,
        data: {
          jsonLd: hasJsonLd,
          microdata: hasMicrodata,
          rdfa: hasRdfa,
          schemaOrg: hasSchemaOrg,
          counts: {
            jsonLd: jsonLdCount,
            microdata: microdataCount,
            rdfa: rdfaCount,
            total: totalStructuredData
          }
        }
      }
    } else {
      return {
        type: 'Rich Results Test',
        status: 'warning',
        message: 'No structured data detected',
        details: 'Consider adding structured data (JSON-LD, Microdata, or RDFa) for better SEO and rich results',
        url: `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`,
        data: {
          jsonLd: false,
          microdata: false,
          rdfa: false,
          schemaOrg: false,
          counts: { jsonLd: 0, microdata: 0, rdfa: 0, total: 0 }
        }
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
