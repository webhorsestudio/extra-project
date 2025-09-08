'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FileText, Target, BookOpen } from 'lucide-react'

interface SEOAuditContentProps {
  auditResult: {
    score: number
    issues: Record<string, unknown>[]
    recommendations: Record<string, unknown>[]
    summary: Record<string, unknown>
  }
}

export function SEOAuditContent({ }: SEOAuditContentProps) {
  // Mock content analysis data - in real implementation, this would come from the audit
  const contentAnalysis = {
    title: {
      text: "Sample Page Title",
      length: 18,
      score: 85,
      issues: [],
      suggestions: []
    },
    description: {
      text: "Sample page description",
      length: 25,
      score: 75,
      issues: ["Could be longer"],
      suggestions: ["Extend to 120-160 characters"]
    },
    keywords: {
      primary: "sample",
      density: 2.5,
      distribution: "good",
      secondary: ["seo", "analysis"]
    },
    readability: {
      score: 78,
      level: "Intermediate",
      suggestions: ["Consider shorter sentences"]
    }
  }

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
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Keywords Analysis
          </CardTitle>
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
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Readability
          </CardTitle>
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
