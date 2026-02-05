import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, content, targetKeywords = [] } = body

    if (!url || !content) {
      return NextResponse.json(
        { error: 'URL and content are required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseAdminClient()

    // Perform comprehensive SEO audit
    const auditResults = await performComprehensiveAudit(url, content, targetKeywords)

    // Store audit results in database
    const { data: auditData, error: auditError } = await supabase
      .from('seo_audit_results')
      .insert({
        url: url,
        audit_type: 'comprehensive',
        results: auditResults,
        target_keywords: targetKeywords,
        status: 'completed',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (auditError) {
      console.error('Error storing audit results:', auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...auditResults,
        auditId: auditData?.id,
        timestamp: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Error performing SEO audit:', error)
    return NextResponse.json(
      { error: 'Failed to perform SEO audit' },
      { status: 500 }
    )
  }
}

async function performComprehensiveAudit(url: string, content: Record<string, unknown>, targetKeywords: string[]) {
  const issues: Array<{
    type: 'error' | 'warning' | 'info'
    category: string
    message: string
    suggestion: string
    priority: 'high' | 'medium' | 'low'
  }> = []

  const recommendations: Array<{
    category: string
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    effort: 'low' | 'medium' | 'high'
  }> = []

  // 1. Title Tag Analysis
  if (!content.title || (content.title as string).length === 0) {
    issues.push({
      type: 'error',
      category: 'Title Tag',
      message: 'Missing title tag',
      suggestion: 'Add a descriptive title tag between 30-60 characters',
      priority: 'high'
    })
  } else if ((content.title as string).length < 30) {
    issues.push({
      type: 'warning',
      category: 'Title Tag',
      message: 'Title tag too short',
      suggestion: 'Extend title to 30-60 characters for better SEO',
      priority: 'medium'
    })
  } else if ((content.title as string).length > 60) {
    issues.push({
      type: 'warning',
      category: 'Title Tag',
      message: 'Title tag too long',
      suggestion: 'Shorten title to under 60 characters to avoid truncation',
      priority: 'medium'
    })
  }

  // 2. Meta Description Analysis
  if (!content.description || (content.description as string).length === 0) {
    issues.push({
      type: 'warning',
      category: 'Meta Description',
      message: 'Missing meta description',
      suggestion: 'Add a compelling meta description between 120-160 characters',
      priority: 'medium'
    })
  } else if ((content.description as string).length < 120) {
    issues.push({
      type: 'info',
      category: 'Meta Description',
      message: 'Meta description could be longer',
      suggestion: 'Extend description to 120-160 characters for better click-through rates',
      priority: 'low'
    })
  } else if ((content.description as string).length > 160) {
    issues.push({
      type: 'warning',
      category: 'Meta Description',
      message: 'Meta description too long',
      suggestion: 'Shorten description to under 160 characters',
      priority: 'medium'
    })
  }

  // 3. Heading Structure Analysis
  const headings = (content.headings as Record<string, unknown>[]) || []
  const h1Count = headings.filter((h: Record<string, unknown>) => h.level === 1).length
  const h2Count = headings.filter((h: Record<string, unknown>) => h.level === 2).length

  if (h1Count === 0) {
    issues.push({
      type: 'error',
      category: 'Heading Structure',
      message: 'Missing H1 tag',
      suggestion: 'Add a single H1 tag to define the main topic',
      priority: 'high'
    })
  } else if (h1Count > 1) {
    issues.push({
      type: 'warning',
      category: 'Heading Structure',
      message: 'Multiple H1 tags found',
      suggestion: 'Use only one H1 tag per page for better structure',
      priority: 'medium'
    })
  }

  if (h2Count === 0 && headings.length > 1) {
    issues.push({
      type: 'info',
      category: 'Heading Structure',
      message: 'Consider adding H2 tags',
      suggestion: 'Use H2 tags to organize content sections',
      priority: 'low'
    })
  }

  // 4. Image Analysis
  const images = (content.images as Record<string, unknown>[]) || []
  const imagesWithoutAlt = images.filter((img: Record<string, unknown>) => !img.alt || (img.alt as string).trim() === '')

  if (imagesWithoutAlt.length > 0) {
    issues.push({
      type: 'warning',
      category: 'Images',
      message: `${imagesWithoutAlt.length} images missing alt text`,
      suggestion: 'Add descriptive alt text to all images for accessibility and SEO',
      priority: 'medium'
    })
  }

  // 5. Internal/External Link Analysis
  const links = (content.links as Record<string, unknown>[]) || []
  const internalLinks = links.filter((link: Record<string, unknown>) => !link.isExternal)
  // const _externalLinks = links.filter((link: Record<string, unknown>) => link.isExternal)

  if (internalLinks.length === 0) {
    issues.push({
      type: 'info',
      category: 'Internal Linking',
      message: 'No internal links found',
      suggestion: 'Add internal links to related pages to improve site structure',
      priority: 'low'
    })
  }

  // 6. Keyword Analysis
  if (targetKeywords.length > 0) {
    const bodyText = (content.body as string) || ''
    const titleText = (content.title as string) || ''
    
    targetKeywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase()
      const bodyOccurrences = (bodyText.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length
      const titleOccurrences = (titleText.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length
      
      if (titleOccurrences === 0) {
        issues.push({
          type: 'warning',
          category: 'Keywords',
          message: `Target keyword "${keyword}" not found in title`,
          suggestion: `Include "${keyword}" in the page title for better relevance`,
          priority: 'medium'
        })
      }
      
      if (bodyOccurrences === 0) {
        issues.push({
          type: 'warning',
          category: 'Keywords',
          message: `Target keyword "${keyword}" not found in content`,
          suggestion: `Naturally include "${keyword}" in the page content`,
          priority: 'medium'
        })
      } else if (bodyOccurrences > 10) {
        issues.push({
          type: 'warning',
          category: 'Keywords',
          message: `Target keyword "${keyword}" may be overused`,
          suggestion: `Reduce keyword density to avoid keyword stuffing`,
          priority: 'low'
        })
      }
    })
  }

  // 7. Content Length Analysis
  const contentLength = (content.body as string)?.length || 0
  if (contentLength < 300) {
    issues.push({
      type: 'warning',
      category: 'Content',
      message: 'Content is too short',
      suggestion: 'Add more valuable content (aim for 300+ words)',
      priority: 'medium'
    })
  }

  // Generate recommendations based on issues
  if (issues.some(i => i.category === 'Title Tag')) {
    recommendations.push({
      category: 'Title Optimization',
      title: 'Optimize Page Title',
      description: 'Create compelling, keyword-rich titles that accurately describe your content',
      impact: 'high',
      effort: 'low'
    })
  }

  if (issues.some(i => i.category === 'Meta Description')) {
    recommendations.push({
      category: 'Meta Description',
      title: 'Write Compelling Meta Descriptions',
      description: 'Create engaging meta descriptions that encourage clicks from search results',
      impact: 'medium',
      effort: 'low'
    })
  }

  if (issues.some(i => i.category === 'Images')) {
    recommendations.push({
      category: 'Image Optimization',
      title: 'Optimize Images',
      description: 'Add alt text and optimize image file sizes for better performance',
      impact: 'medium',
      effort: 'medium'
    })
  }

  if (issues.some(i => i.category === 'Internal Linking')) {
    recommendations.push({
      category: 'Internal Linking',
      title: 'Improve Internal Linking',
      description: 'Add relevant internal links to improve site structure and user experience',
      impact: 'medium',
      effort: 'medium'
    })
  }

  // Calculate overall score
  const totalIssues = issues.length
  const highPriorityIssues = issues.filter(i => i.priority === 'high').length
  const mediumPriorityIssues = issues.filter(i => i.priority === 'medium').length
  
  let score = 100
  score -= highPriorityIssues * 20
  score -= mediumPriorityIssues * 10
  score -= (totalIssues - highPriorityIssues - mediumPriorityIssues) * 5
  score = Math.max(0, score)

  return {
    score: Math.round(score),
    issues,
    recommendations,
    summary: {
      totalIssues,
      highPriorityIssues,
      mediumPriorityIssues,
      lowPriorityIssues: totalIssues - highPriorityIssues - mediumPriorityIssues,
      totalRecommendations: recommendations.length
    }
  }
}
