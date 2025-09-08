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

    const result = await testMetaTags(url)

    return NextResponse.json({
      success: true,
      url,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Meta Tags Test API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function testMetaTags(url: string) {
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
    
    // Extract meta tags with more comprehensive patterns
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i)
    
    // Open Graph tags
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const ogDescriptionMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const ogUrlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const ogTypeMatch = html.match(/<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const ogSiteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    
    // Twitter Card tags
    const twitterCardMatch = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const twitterTitleMatch = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const twitterDescriptionMatch = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const twitterSiteMatch = html.match(/<meta[^>]*name=["']twitter:site["'][^>]*content=["']([^"']*)["'][^>]*>/i)

    // Check presence of tags
    const hasTitle = !!titleMatch
    const hasDescription = !!descriptionMatch
    const hasKeywords = !!keywordsMatch
    const hasAuthor = !!authorMatch
    const hasRobots = !!robotsMatch
    const hasCanonical = !!canonicalMatch
    
    const hasOgTitle = !!ogTitleMatch
    const hasOgDescription = !!ogDescriptionMatch
    const hasOgImage = !!ogImageMatch
    const hasOgUrl = !!ogUrlMatch
    const hasOgType = !!ogTypeMatch
    const hasOgSiteName = !!ogSiteNameMatch
    
    const hasTwitterCard = !!twitterCardMatch
    const hasTwitterTitle = !!twitterTitleMatch
    const hasTwitterDescription = !!twitterDescriptionMatch
    const hasTwitterImage = !!twitterImageMatch
    const hasTwitterSite = !!twitterSiteMatch

    // Calculate scores with more lenient weighting
    const essentialTags = [hasTitle, hasDescription, hasCanonical]
    const seoTags = [hasKeywords, hasAuthor, hasRobots]
    const ogTags = [hasOgTitle, hasOgDescription, hasOgImage, hasOgUrl, hasOgType, hasOgSiteName]
    const twitterTags = [hasTwitterCard, hasTwitterTitle, hasTwitterDescription, hasTwitterImage, hasTwitterSite]
    
    const essentialScore = essentialTags.filter(Boolean).length / essentialTags.length
    const seoScore = seoTags.filter(Boolean).length / seoTags.length
    const ogScore = ogTags.filter(Boolean).length / ogTags.length
    const twitterScore = twitterTags.filter(Boolean).length / twitterTags.length
    
    // More lenient scoring: Essential tags are most important, others are bonus
    const overallScore = (essentialScore * 0.6 + seoScore * 0.15 + ogScore * 0.15 + twitterScore * 0.1) * 100

    let status: 'success' | 'warning' | 'error' = 'success'
    if (overallScore < 40) status = 'error'  // Lowered threshold
    else if (overallScore < 70) status = 'warning'  // Lowered threshold

    // Analyze content quality
    const titleLength = titleMatch ? titleMatch[1].length : 0
    const descriptionLength = descriptionMatch ? descriptionMatch[1].length : 0
    
    const titleGood = titleLength >= 30 && titleLength <= 60
    const descriptionGood = descriptionLength >= 120 && descriptionLength <= 160

    return {
      type: 'Meta Tags',
      status,
      message: hasTitle && hasDescription ? 'Meta tags present' : 'Missing essential meta tags',
      details: `Overall Score: ${Math.round(overallScore)}/100. Essential: ${Math.round(essentialScore * 100)}%, SEO: ${Math.round(seoScore * 100)}%, Open Graph: ${Math.round(ogScore * 100)}%, Twitter: ${Math.round(twitterScore * 100)}%`,
      score: Math.round(overallScore),
      data: {
        essential: {
          title: hasTitle,
          description: hasDescription,
          canonical: hasCanonical,
          titleLength,
          descriptionLength,
          titleGood,
          descriptionGood
        },
        seo: {
          keywords: hasKeywords,
          author: hasAuthor,
          robots: hasRobots
        },
        openGraph: {
          title: hasOgTitle,
          description: hasOgDescription,
          image: hasOgImage,
          url: hasOgUrl,
          type: hasOgType,
          siteName: hasOgSiteName
        },
        twitter: {
          card: hasTwitterCard,
          title: hasTwitterTitle,
          description: hasTwitterDescription,
          image: hasTwitterImage,
          site: hasTwitterSite
        },
        scores: {
          essential: Math.round(essentialScore * 100),
          seo: Math.round(seoScore * 100),
          openGraph: Math.round(ogScore * 100),
          twitter: Math.round(twitterScore * 100),
          overall: Math.round(overallScore)
        },
        recommendations: generateRecommendations({
          hasTitle, hasDescription, hasKeywords, hasAuthor, hasRobots, hasCanonical,
          hasOgTitle, hasOgDescription, hasOgImage, hasOgUrl, hasOgType, hasOgSiteName,
          hasTwitterCard, hasTwitterTitle, hasTwitterDescription, hasTwitterImage, hasTwitterSite,
          titleGood, descriptionGood
        })
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

function generateRecommendations(tags: Record<string, unknown>) {
  const recommendations: string[] = []
  
  if (!tags.hasTitle) recommendations.push('Add a unique, descriptive title tag (30-60 characters)')
  if (!tags.hasDescription) recommendations.push('Add a meta description (120-160 characters)')
  if (!tags.hasCanonical) recommendations.push('Add a canonical URL to prevent duplicate content issues')
  if (!tags.hasRobots) recommendations.push('Add robots meta tag for better crawl control')
  if (!tags.hasKeywords) recommendations.push('Consider adding relevant keywords meta tag')
  if (!tags.hasAuthor) recommendations.push('Add author meta tag for content attribution')
  
  if (!tags.hasOgTitle) recommendations.push('Add Open Graph title for better social sharing')
  if (!tags.hasOgDescription) recommendations.push('Add Open Graph description for social media')
  if (!tags.hasOgImage) recommendations.push('Add Open Graph image for social media previews')
  if (!tags.hasOgUrl) recommendations.push('Add Open Graph URL for social sharing')
  if (!tags.hasOgType) recommendations.push('Add Open Graph type (article, website, etc.)')
  if (!tags.hasOgSiteName) recommendations.push('Add Open Graph site name')
  
  if (!tags.hasTwitterCard) recommendations.push('Add Twitter Card meta tag')
  if (!tags.hasTwitterTitle) recommendations.push('Add Twitter title for better Twitter sharing')
  if (!tags.hasTwitterDescription) recommendations.push('Add Twitter description')
  if (!tags.hasTwitterImage) recommendations.push('Add Twitter image for Twitter previews')
  if (!tags.hasTwitterSite) recommendations.push('Add Twitter site handle')
  
  if (tags.hasTitle && !tags.titleGood) {
    recommendations.push('Optimize title length (currently too short or too long)')
  }
  if (tags.hasDescription && !tags.descriptionGood) {
    recommendations.push('Optimize description length (currently too short or too long)')
  }
  
  return recommendations
}
