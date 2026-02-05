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

    const result = await testStructuredData(url)

    return NextResponse.json({
      success: true,
      url,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Structured Data Test API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function testStructuredData(url: string) {
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

    // Parse JSON-LD data if present
    let jsonLdData: Record<string, unknown>[] = []
    if (hasJsonLd && jsonLdMatches) {
      jsonLdData = jsonLdMatches.map(match => {
        try {
          const jsonMatch = match.match(/<script[^>]*>(.*?)<\/script>/s)
          if (jsonMatch) {
            return JSON.parse(jsonMatch[1])
          }
        } catch {
          // Invalid JSON, skip
        }
        return null
      }).filter(Boolean)
    }

    // Extract schema types
    const schemaTypes = new Set<string>()
    jsonLdData.forEach(data => {
      if (data['@type']) {
        if (Array.isArray(data['@type'])) {
          data['@type'].forEach((type: string) => schemaTypes.add(type))
        } else {
          schemaTypes.add(data['@type'] as string)
        }
      }
    })

    // Count structured data elements
    const jsonLdCount = jsonLdMatches ? jsonLdMatches.length : 0
    const microdataCount = microdataMatches ? microdataMatches.length : 0
    const rdfaCount = rdfaMatches ? rdfaMatches.length : 0

    if (hasStructuredData) {
      return {
        type: 'Structured Data',
        status: 'success',
        message: 'Structured data found',
        details: `JSON-LD: ${jsonLdCount} blocks, Microdata: ${microdataCount} elements, RDFa: ${rdfaCount} elements. Schema types: ${Array.from(schemaTypes).join(', ') || 'Unknown'}`,
        url: `https://validator.schema.org/#url=${encodeURIComponent(url)}`,
        data: {
          jsonLd: hasJsonLd,
          microdata: hasMicrodata,
          rdfa: hasRdfa,
          jsonLdCount,
          microdataCount,
          rdfaCount,
          schemaTypes: Array.from(schemaTypes),
          jsonLdData: jsonLdData.slice(0, 5) // Limit to first 5 for response size
        }
      }
    } else {
      return {
        type: 'Structured Data',
        status: 'warning',
        message: 'No structured data detected',
        details: 'Consider adding structured data for better SEO. Recommended: JSON-LD for Organization, WebSite, and content-specific schemas',
        url: `https://validator.schema.org/#url=${encodeURIComponent(url)}`,
        data: {
          jsonLd: false,
          microdata: false,
          rdfa: false,
          jsonLdCount: 0,
          microdataCount: 0,
          rdfaCount: 0,
          schemaTypes: [],
          recommendations: [
            'Add JSON-LD structured data for your organization',
            'Include WebSite schema for your homepage',
            'Add Article schema for blog posts',
            'Include Product schema for e-commerce items',
            'Add LocalBusiness schema if applicable'
          ]
        }
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
