/**
 * SEO management tools for content creators and administrators
 */

// import { SEOConfig } from './types'

/**
 * SEO audit interface
 */
export interface SEOAudit {
  url: string
  score: number
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    category: string
    message: string
    suggestion: string
    priority: 'high' | 'medium' | 'low'
  }>
  recommendations: string[]
  lastChecked: string
}

/**
 * SEO keyword analysis
 */
export interface KeywordAnalysis {
  keyword: string
  searchVolume: number
  difficulty: number
  cpc: number
  competition: 'low' | 'medium' | 'high'
  trends: Array<{
    month: string
    volume: number
  }>
  relatedKeywords: string[]
  longTailKeywords: string[]
}

/**
 * Content SEO analysis
 */
export interface ContentSEOAnalysis {
  title: {
    text: string
    length: number
    score: number
    issues: string[]
    suggestions: string[]
  }
  description: {
    text: string
    length: number
    score: number
    issues: string[]
    suggestions: string[]
  }
  headings: {
    h1: Array<{
      text: string
      length: number
      score: number
    }>
    h2: Array<{
      text: string
      length: number
      score: number
    }>
    h3: Array<{
      text: string
      length: number
      score: number
    }>
  }
  keywords: {
    primary: string
    secondary: string[]
    density: number
    distribution: 'good' | 'fair' | 'poor'
  }
  readability: {
    score: number
    level: 'easy' | 'fair' | 'difficult'
    suggestions: string[]
  }
  images: Array<{
    url: string
    alt: string
    score: number
    issues: string[]
  }>
  links: {
    internal: number
    external: number
    score: number
    issues: string[]
  }
  overall: {
    score: number
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
    summary: string
  }
}

/**
 * Perform SEO audit on a page
 */
export function performSEOAudit(
  url: string,
  content: {
    title: string
    description: string
    headings: Array<{
      level: number
      text: string
    }>
    body: string
    images: Array<{
      src: string
      alt: string
    }>
    links: Array<{
      href: string
      text: string
      isExternal: boolean
    }>
    metaTags: Record<string, string>
  }
): SEOAudit {
  const issues: SEOAudit['issues'] = []
  const recommendations: string[] = []
  let score = 100

  // Title analysis
  if (!content.title) {
    issues.push({
      type: 'error',
      category: 'Title',
      message: 'Missing page title',
      suggestion: 'Add a descriptive title tag',
      priority: 'high',
    })
    score -= 20
  } else {
    if (content.title.length < 30) {
      issues.push({
        type: 'warning',
        category: 'Title',
        message: 'Title is too short',
        suggestion: 'Make title more descriptive (30-60 characters)',
        priority: 'medium',
      })
      score -= 5
    } else if (content.title.length > 60) {
      issues.push({
        type: 'warning',
        category: 'Title',
        message: 'Title is too long',
        suggestion: 'Shorten title to under 60 characters',
        priority: 'medium',
      })
      score -= 5
    }
  }

  // Description analysis
  if (!content.description) {
    issues.push({
      type: 'error',
      category: 'Description',
      message: 'Missing meta description',
      suggestion: 'Add a compelling meta description',
      priority: 'high',
    })
    score -= 15
  } else {
    if (content.description.length < 120) {
      issues.push({
        type: 'warning',
        category: 'Description',
        message: 'Description is too short',
        suggestion: 'Make description more compelling (120-160 characters)',
        priority: 'medium',
      })
      score -= 3
    } else if (content.description.length > 160) {
      issues.push({
        type: 'warning',
        category: 'Description',
        message: 'Description is too long',
        suggestion: 'Shorten description to under 160 characters',
        priority: 'medium',
      })
      score -= 3
    }
  }

  // Heading analysis
  const h1Count = content.headings.filter(h => h.level === 1).length
  if (h1Count === 0) {
    issues.push({
      type: 'error',
      category: 'Headings',
      message: 'Missing H1 tag',
      suggestion: 'Add a single H1 tag to the page',
      priority: 'high',
    })
    score -= 15
  } else if (h1Count > 1) {
    issues.push({
      type: 'warning',
      category: 'Headings',
      message: 'Multiple H1 tags found',
      suggestion: 'Use only one H1 tag per page',
      priority: 'medium',
    })
    score -= 5
  }

  // Image analysis
  content.images.forEach((image, index) => {
    if (!image.alt) {
      issues.push({
        type: 'error',
        category: 'Images',
        message: `Image ${index + 1} missing alt text`,
        suggestion: 'Add descriptive alt text for accessibility and SEO',
        priority: 'high',
      })
      score -= 5
    } else if (image.alt.length > 125) {
      issues.push({
        type: 'warning',
        category: 'Images',
        message: `Image ${index + 1} alt text is too long`,
        suggestion: 'Keep alt text under 125 characters',
        priority: 'low',
      })
      score -= 1
    }
  })

  // Link analysis
  const externalLinks = content.links.filter(link => link.isExternal)
  if (externalLinks.length === 0) {
    issues.push({
      type: 'info',
      category: 'Links',
      message: 'No external links found',
      suggestion: 'Consider adding relevant external links for authority',
      priority: 'low',
    })
  }

  // Content length analysis
  const wordCount = content.body.split(/\s+/).length
  if (wordCount < 300) {
    issues.push({
      type: 'warning',
      category: 'Content',
      message: 'Content is too short',
      suggestion: 'Add more valuable content (minimum 300 words)',
      priority: 'medium',
    })
    score -= 10
  }

  // Generate recommendations
  if (score < 70) {
    recommendations.push('Focus on fixing high-priority issues first')
  }
  if (content.images.length === 0) {
    recommendations.push('Add relevant images to improve user engagement')
  }
  if (content.links.filter(link => !link.isExternal).length < 3) {
    recommendations.push('Add more internal links to improve site structure')
  }
  if (wordCount < 500) {
    recommendations.push('Expand content to provide more value to users')
  }

  return {
    url,
    score: Math.max(0, score),
    issues,
    recommendations,
    lastChecked: new Date().toISOString(),
  }
}

/**
 * Analyze content for SEO
 */
export function analyzeContentSEO(
  content: {
    title: string
    description: string
    body: string
    headings: Array<{
      level: number
      text: string
    }>
    images: Array<{
      src: string
      alt: string
    }>
    links: Array<{
      href: string
      text: string
      isExternal: boolean
    }>
  },
  targetKeywords: string[]
): ContentSEOAnalysis {
  // Title analysis
  const titleAnalysis = {
    text: content.title,
    length: content.title.length,
    score: 0,
    issues: [] as string[],
    suggestions: [] as string[],
  }

  if (content.title.length >= 30 && content.title.length <= 60) {
    titleAnalysis.score = 100
  } else if (content.title.length < 30) {
    titleAnalysis.score = 60
    titleAnalysis.issues.push('Title is too short')
    titleAnalysis.suggestions.push('Make title more descriptive')
  } else {
    titleAnalysis.score = 70
    titleAnalysis.issues.push('Title is too long')
    titleAnalysis.suggestions.push('Shorten title to under 60 characters')
  }

  // Description analysis
  const descriptionAnalysis = {
    text: content.description,
    length: content.description.length,
    score: 0,
    issues: [] as string[],
    suggestions: [] as string[],
  }

  if (content.description.length >= 120 && content.description.length <= 160) {
    descriptionAnalysis.score = 100
  } else if (content.description.length < 120) {
    descriptionAnalysis.score = 60
    descriptionAnalysis.issues.push('Description is too short')
    descriptionAnalysis.suggestions.push('Make description more compelling')
  } else {
    descriptionAnalysis.score = 70
    descriptionAnalysis.issues.push('Description is too long')
    descriptionAnalysis.suggestions.push('Shorten description to under 160 characters')
  }

  // Heading analysis
  const headings = {
    h1: content.headings.filter(h => h.level === 1).map(h => ({
      text: h.text,
      length: h.text.length,
      score: h.text.length >= 20 && h.text.length <= 60 ? 100 : 70,
    })),
    h2: content.headings.filter(h => h.level === 2).map(h => ({
      text: h.text,
      length: h.text.length,
      score: h.text.length >= 20 && h.text.length <= 60 ? 100 : 70,
    })),
    h3: content.headings.filter(h => h.level === 3).map(h => ({
      text: h.text,
      length: h.text.length,
      score: h.text.length >= 20 && h.text.length <= 60 ? 100 : 70,
    })),
  }

  // Keyword analysis
  const bodyText = content.body.toLowerCase()
  const keywordCounts = targetKeywords.map(keyword => ({
    keyword,
    count: (bodyText.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length,
  }))

  const totalWords = content.body.split(/\s+/).length
  const keywordDensity = keywordCounts.reduce((sum, k) => sum + k.count, 0) / totalWords * 100

  const keywords = {
    primary: targetKeywords[0] || '',
    secondary: targetKeywords.slice(1),
    density: keywordDensity,
    distribution: (keywordDensity >= 1 && keywordDensity <= 3 ? 'good' : keywordDensity < 1 ? 'poor' : 'fair') as 'good' | 'fair' | 'poor',
  }

  // Readability analysis (simplified)
  const sentences = content.body.split(/[.!?]+/).length
  const words = content.body.split(/\s+/).length
  const syllables = content.body.split(/\s+/).reduce((sum, word) => sum + countSyllables(word), 0)
  
  const readabilityScore = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
  
  const readability = {
    score: Math.max(0, Math.min(100, readabilityScore)),
    level: (readabilityScore >= 80 ? 'easy' : readabilityScore >= 60 ? 'fair' : 'difficult') as 'fair' | 'easy' | 'difficult',
    suggestions: readabilityScore < 60 ? [
      'Use shorter sentences',
      'Use simpler words',
      'Break up long paragraphs',
    ] : [],
  }

  // Image analysis
  const images = content.images.map(image => ({
    url: image.src,
    alt: image.alt,
    score: image.alt ? (image.alt.length <= 125 ? 100 : 70) : 0,
    issues: image.alt ? (image.alt.length > 125 ? ['Alt text too long'] : []) : ['Missing alt text'],
  }))

  // Link analysis
  const internalLinks = content.links.filter(link => !link.isExternal).length
  const externalLinks = content.links.filter(link => link.isExternal).length
  
  const links = {
    internal: internalLinks,
    external: externalLinks,
    score: internalLinks >= 3 ? 100 : internalLinks >= 1 ? 70 : 0,
    issues: internalLinks < 3 ? ['Need more internal links'] : [],
  }

  // Overall score calculation
  const overallScore = Math.round((
    titleAnalysis.score * 0.2 +
    descriptionAnalysis.score * 0.15 +
    (headings.h1.length > 0 ? 100 : 0) * 0.15 +
    keywords.distribution === 'good' ? 100 : keywords.distribution === 'fair' ? 70 : 40) * 0.2 +
    readability.score * 0.15 +
    images.reduce((sum, img) => sum + img.score, 0) / images.length * 0.1 +
    links.score * 0.05
  )

  const grade = overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : overallScore >= 70 ? 'C' : overallScore >= 60 ? 'D' : 'F'

  return {
    title: titleAnalysis,
    description: descriptionAnalysis,
    headings,
    keywords,
    readability,
    images,
    links,
    overall: {
      score: overallScore,
      grade,
      summary: `Content SEO Score: ${overallScore}/100 (Grade: ${grade})`,
    },
  }
}

/**
 * Count syllables in a word (simplified)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase()
  if (word.length <= 3) return 1
  
  const vowels = 'aeiouy'
  let count = 0
  let previousWasVowel = false
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i])
    if (isVowel && !previousWasVowel) {
      count++
    }
    previousWasVowel = isVowel
  }
  
  if (word.endsWith('e')) count--
  if (count === 0) count = 1
  
  return count
}

/**
 * Generate SEO recommendations
 */
export function generateSEORecommendations(
  analysis: ContentSEOAnalysis
): {
  priority: 'high' | 'medium' | 'low'
  category: string
  recommendation: string
  impact: string
}[] {
  const recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    category: string
    recommendation: string
    impact: string
  }> = []

  // Title recommendations
  if (analysis.title.score < 80) {
    recommendations.push({
      priority: 'high',
      category: 'Title',
      recommendation: 'Optimize page title for better SEO',
      impact: 'High impact on search rankings',
    })
  }

  // Description recommendations
  if (analysis.description.score < 80) {
    recommendations.push({
      priority: 'high',
      category: 'Description',
      recommendation: 'Improve meta description',
      impact: 'High impact on click-through rates',
    })
  }

  // Keyword recommendations
  if (analysis.keywords.distribution === 'poor') {
    recommendations.push({
      priority: 'high',
      category: 'Keywords',
      recommendation: 'Improve keyword density and distribution',
      impact: 'High impact on search visibility',
    })
  }

  // Readability recommendations
  if (analysis.readability.score < 60) {
    recommendations.push({
      priority: 'medium',
      category: 'Readability',
      recommendation: 'Improve content readability',
      impact: 'Medium impact on user engagement',
    })
  }

  // Image recommendations
  const imagesWithIssues = analysis.images.filter(img => img.score < 80)
  if (imagesWithIssues.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'Images',
      recommendation: 'Optimize image alt text',
      impact: 'Medium impact on accessibility and SEO',
    })
  }

  // Link recommendations
  if (analysis.links.score < 80) {
    recommendations.push({
      priority: 'low',
      category: 'Links',
      recommendation: 'Add more internal links',
      impact: 'Low impact on site structure',
    })
  }

  return recommendations
}

/**
 * Generate keyword suggestions
 */
export function generateKeywordSuggestions(
  baseKeyword: string,
  content: string
): {
  primary: string[]
  secondary: string[]
  longTail: string[]
  related: string[]
} {
  // This is a simplified version - in production, you'd use a keyword research API
  const words = content.toLowerCase().split(/\s+/)
  const wordFreq: Record<string, number> = {}
  
  words.forEach(word => {
    if (word.length > 3) {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    }
  })

  const sortedWords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)

  return {
    primary: [baseKeyword],
    secondary: sortedWords.slice(0, 5),
    longTail: [
      `${baseKeyword} in bangalore`,
      `best ${baseKeyword}`,
      `${baseKeyword} for sale`,
      `affordable ${baseKeyword}`,
      `luxury ${baseKeyword}`,
    ],
    related: sortedWords.slice(5),
  }
}

/**
 * Generate SEO checklist
 */
export function generateSEOChecklist(): Array<{
  category: string
  items: Array<{
    task: string
    description: string
    priority: 'high' | 'medium' | 'low'
    completed: boolean
  }>
}> {
  return [
    {
      category: 'On-Page SEO',
      items: [
        {
          task: 'Title Tag Optimization',
          description: 'Ensure title is 30-60 characters and includes primary keyword',
          priority: 'high',
          completed: false,
        },
        {
          task: 'Meta Description',
          description: 'Write compelling meta description (120-160 characters)',
          priority: 'high',
          completed: false,
        },
        {
          task: 'Header Tags',
          description: 'Use proper H1, H2, H3 structure with keywords',
          priority: 'high',
          completed: false,
        },
        {
          task: 'Image Alt Text',
          description: 'Add descriptive alt text to all images',
          priority: 'medium',
          completed: false,
        },
        {
          task: 'Internal Linking',
          description: 'Add relevant internal links to other pages',
          priority: 'medium',
          completed: false,
        },
      ],
    },
    {
      category: 'Content SEO',
      items: [
        {
          task: 'Keyword Research',
          description: 'Research and target relevant keywords',
          priority: 'high',
          completed: false,
        },
        {
          task: 'Content Quality',
          description: 'Create high-quality, original content (300+ words)',
          priority: 'high',
          completed: false,
        },
        {
          task: 'Keyword Density',
          description: 'Maintain 1-3% keyword density',
          priority: 'medium',
          completed: false,
        },
        {
          task: 'Content Structure',
          description: 'Use proper headings and bullet points',
          priority: 'medium',
          completed: false,
        },
        {
          task: 'Readability',
          description: 'Ensure content is easy to read and understand',
          priority: 'low',
          completed: false,
        },
      ],
    },
    {
      category: 'Technical SEO',
      items: [
        {
          task: 'Page Speed',
          description: 'Optimize page loading speed',
          priority: 'high',
          completed: false,
        },
        {
          task: 'Mobile Optimization',
          description: 'Ensure mobile-friendly design',
          priority: 'high',
          completed: false,
        },
        {
          task: 'SSL Certificate',
          description: 'Use HTTPS for security',
          priority: 'high',
          completed: false,
        },
        {
          task: 'XML Sitemap',
          description: 'Create and submit XML sitemap',
          priority: 'medium',
          completed: false,
        },
        {
          task: 'Robots.txt',
          description: 'Configure robots.txt file',
          priority: 'medium',
          completed: false,
        },
      ],
    },
  ]
}
