'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Search, 
  FileText, 
  Image, 
  Link, 
  // Zap,
  Target,
  TrendingUp,
  // TrendingDown
} from 'lucide-react'
import { performSEOAudit, analyzeContentSEO, generateSEORecommendations } from '@/lib/seo/seo-management'
import type { SEOAudit, ContentSEOAnalysis } from '@/lib/seo/seo-management'

interface SEOAuditProps {
  url: string
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
  targetKeywords?: string[]
  className?: string
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  category: string
  recommendation: string
  impact: string
}

export function SEOAudit({ url, content, targetKeywords = [], className = '' }: SEOAuditProps) {
  const [auditResult, setAuditResult] = useState<SEOAudit | null>(null)
  const [contentAnalysis, setContentAnalysis] = useState<ContentSEOAnalysis | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)

  const runAudit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          content,
          targetKeywords,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const auditData = result.data as SEOAudit
        
        setAuditResult(auditData)
        
        // Create a proper ContentSEOAnalysis object
        const analysis = analyzeContentSEO(content, targetKeywords)
        setContentAnalysis(analysis)
        
        setRecommendations((auditData.recommendations || []).map(rec => ({
          priority: 'medium' as const,
          category: 'General',
          recommendation: rec,
          impact: 'Improves SEO performance'
        })))
      } else {
        // Fallback to mock data if API fails
        const audit = performSEOAudit(url, content)
        setAuditResult(audit)

        const analysis = analyzeContentSEO(content, targetKeywords)
        setContentAnalysis(analysis)

        const recs = generateSEORecommendations(analysis)
        setRecommendations(recs)
      }
    } catch (error) {
      console.error('Error running SEO audit:', error)
      // Fallback to mock data
      try {
        const audit = performSEOAudit(url, content)
        setAuditResult(audit)

        const analysis = analyzeContentSEO(content, targetKeywords)
        setContentAnalysis(analysis)

        const recs = generateSEORecommendations(analysis)
        setRecommendations(recs)
      } catch (fallbackError) {
        console.error('Error with fallback audit:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    if (score >= 40) return <Badge className="bg-orange-100 text-orange-800">Fair</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Audit</h2>
          <p className="text-gray-600 mt-1">Analyze your page&apos;s SEO performance</p>
        </div>
        <Button onClick={runAudit} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          {loading ? 'Running Audit...' : 'Run Audit'}
        </Button>
      </div>

      {auditResult && (
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Overall SEO Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(auditResult.score)}`}>
                  {auditResult.score}
                </div>
                <Progress value={auditResult.score} className="mb-4" />
                <div className="flex items-center justify-center space-x-2">
                  {getScoreBadge(auditResult.score)}
                  <span className="text-sm text-gray-600">out of 100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Tabs defaultValue="issues" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-6">
              <IssuesTab auditResult={auditResult} />
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <ContentTab contentAnalysis={contentAnalysis} />
            </TabsContent>

            <TabsContent value="technical" className="space-y-6">
              <TechnicalTab content={content} />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <RecommendationsTab recommendations={recommendations} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

interface ContentData {
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

interface TabProps {
  auditResult?: SEOAudit | null
  contentAnalysis?: ContentSEOAnalysis | null
  content?: ContentData
  recommendations?: Recommendation[]
}

function IssuesTab({ auditResult }: TabProps) {
  if (!auditResult) return null

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>
      case 'medium':
        return <Badge variant="default">Medium</Badge>
      default:
        return <Badge variant="secondary">Low</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Issues Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {auditResult.issues.filter((i) => i.type === 'error').length}
            </div>
            <p className="text-sm text-gray-600">Errors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {auditResult.issues.filter((i) => i.type === 'warning').length}
            </div>
            <p className="text-sm text-gray-600">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {auditResult.issues.filter((i) => i.type === 'info').length}
            </div>
            <p className="text-sm text-gray-600">Info</p>
          </CardContent>
        </Card>
      </div>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>Issues Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditResult.issues.map((issue, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getIssueIcon(issue.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{issue.message}</h4>
                    {getPriorityBadge(issue.priority)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{issue.suggestion}</p>
                  <Badge variant="outline" className="text-xs">{issue.category}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ContentTab({ contentAnalysis }: TabProps) {
  if (!contentAnalysis) return null

  return (
    <div className="space-y-6">
      {/* Content Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Title Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Score</span>
                  <span className="text-sm text-gray-600">{contentAnalysis.title.score}/100</span>
                </div>
                <Progress value={contentAnalysis.title.score} className="mb-2" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Title:</p>
                <p className="font-medium text-gray-900">{contentAnalysis.title.text}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Length: {contentAnalysis.title.length} characters</p>
                {contentAnalysis.title.issues.length > 0 && (
                  <div className="space-y-1">
                    {contentAnalysis.title.issues.map((issue: string, index: number) => (
                      <p key={index} className="text-sm text-red-600">• {issue}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Description Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Score</span>
                  <span className="text-sm text-gray-600">{contentAnalysis.description.score}/100</span>
                </div>
                <Progress value={contentAnalysis.description.score} className="mb-2" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Description:</p>
                <p className="font-medium text-gray-900">{contentAnalysis.description.text}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Length: {contentAnalysis.description.length} characters</p>
                {contentAnalysis.description.issues.length > 0 && (
                  <div className="space-y-1">
                    {contentAnalysis.description.issues.map((issue: string, index: number) => (
                      <p key={index} className="text-sm text-red-600">• {issue}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keywords Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Keywords Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Primary Keyword</p>
                <p className="font-medium text-gray-900">{contentAnalysis.keywords.primary}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Density</p>
                <p className="font-medium text-gray-900">{contentAnalysis.keywords.density.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Distribution</p>
                <Badge variant={contentAnalysis.keywords.distribution === 'good' ? 'default' : 'secondary'}>
                  {contentAnalysis.keywords.distribution}
                </Badge>
              </div>
            </div>
            {contentAnalysis.keywords.secondary.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Secondary Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {contentAnalysis.keywords.secondary.map((keyword: string, index: number) => (
                    <Badge key={index} variant="outline">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Readability */}
      <Card>
        <CardHeader>
          <CardTitle>Readability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Score</span>
                <span className="text-sm text-gray-600">{contentAnalysis.readability.score.toFixed(0)}/100</span>
              </div>
              <Progress value={contentAnalysis.readability.score} className="mb-2" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Level: {contentAnalysis.readability.level}</p>
              {contentAnalysis.readability.suggestions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 mb-1">Suggestions:</p>
                  {contentAnalysis.readability.suggestions.map((suggestion: string, index: number) => (
                    <p key={index} className="text-sm text-blue-600">• {suggestion}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TechnicalTab({ content }: TabProps) {
  if (!content) return null

  return (
    <div className="space-y-6">
      {/* Images Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="h-5 w-5 mr-2" />
            Images Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Images</p>
                <p className="text-2xl font-bold text-gray-900">{content.images.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">With Alt Text</p>
                <p className="text-2xl font-bold text-green-600">
                  {content.images.filter((img) => img.alt).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Missing Alt Text</p>
                <p className="text-2xl font-bold text-red-600">
                  {content.images.filter((img) => !img.alt).length}
                </p>
              </div>
            </div>
            {content.images.length > 0 && (
              <div className="space-y-2">
                {content.images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 border rounded">
                    <div className="flex-shrink-0">
                      {image.alt ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{image.src}</p>
                      {image.alt && (
                        <p className="text-sm text-gray-600 truncate">{image.alt}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Links Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link className="h-5 w-5 mr-2" />
            Links Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Internal Links</p>
              <p className="text-2xl font-bold text-blue-600">
                {(content.links as Record<string, unknown>[]).filter((link: Record<string, unknown>) => !link.isExternal).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">External Links</p>
              <p className="text-2xl font-bold text-green-600">
                {(content.links as Record<string, unknown>[]).filter((link: Record<string, unknown>) => link.isExternal).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Headings Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Headings Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">H1 Tags</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(content.headings as Record<string, unknown>[]).filter((h: Record<string, unknown>) => h.level === 1).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">H2 Tags</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(content.headings as Record<string, unknown>[]).filter((h: Record<string, unknown>) => h.level === 2).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">H3 Tags</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(content.headings as Record<string, unknown>[]).filter((h: Record<string, unknown>) => h.level === 3).length}
                </p>
              </div>
            </div>
            {content.headings.length > 0 && (
              <div className="space-y-2">
                {content.headings.map((heading, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 border rounded">
                    <Badge variant="outline">H{heading.level}</Badge>
                    <p className="text-sm font-medium text-gray-900">{heading.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RecommendationsTab({ recommendations }: TabProps) {
  if (!recommendations) return null

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <TrendingUp className="h-5 w-5 text-red-500" />
      case 'medium':
        return <TrendingUp className="h-5 w-5 text-yellow-500" />
      default:
        return <TrendingUp className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>
      case 'medium':
        return <Badge variant="default">Medium Priority</Badge>
      default:
        return <Badge variant="secondary">Low Priority</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SEO Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getPriorityIcon(rec.priority)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{rec.recommendation}</h4>
                    {getPriorityBadge(rec.priority)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.impact}</p>
                  <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
