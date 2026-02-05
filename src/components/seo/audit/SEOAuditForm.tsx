'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, X, Globe } from 'lucide-react'

interface SEOAuditFormProps {
  onAuditComplete: (result: Record<string, unknown>) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export function SEOAuditForm({ onAuditComplete, loading, setLoading }: SEOAuditFormProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState('')

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()])
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  const runAudit = async () => {
    if (!url.trim()) {
      alert('Please enter a URL to audit')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          content: {
            title: title || 'Sample Page Title',
            description: description || 'Sample page description',
            headings: [
              { level: 1, text: 'Main Heading' },
              { level: 2, text: 'Sub Heading' }
            ],
            body: content || 'Sample page content for SEO analysis',
            images: [
              { src: '/image.jpg', alt: 'Sample image' }
            ],
            links: [
              { href: '/internal', text: 'Internal Link', isExternal: false },
              { href: 'https://external.com', text: 'External Link', isExternal: true }
            ],
            metaTags: {
              'og:title': title || 'Sample Page',
              'og:description': description || 'Sample description'
            }
          },
          targetKeywords: keywords,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const auditData = result.data
        
        onAuditComplete({
          score: auditData.score,
          issues: auditData.issues,
          recommendations: auditData.recommendations,
          summary: auditData.summary
        })
      } else {
        throw new Error('Audit failed')
      }
    } catch (error) {
      console.error('Error running SEO audit:', error)
      alert('Failed to run SEO audit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Audit Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="url">Website URL *</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Content Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input
              id="title"
              placeholder="Enter page title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Meta Description</Label>
            <Input
              id="description"
              placeholder="Enter meta description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Page Content</Label>
          <Textarea
            id="content"
            placeholder="Enter page content for analysis"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            rows={4}
          />
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label>Target Keywords</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter keyword"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              disabled={loading}
            />
            <Button
              type="button"
              onClick={addKeyword}
              disabled={loading || !newKeyword.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    disabled={loading}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Run Audit Button */}
        <Button 
          onClick={runAudit} 
          disabled={loading || !url.trim()}
          className="w-full"
        >
          <Search className="h-4 w-4 mr-2" />
          {loading ? 'Running Audit...' : 'Run SEO Audit'}
        </Button>
      </CardContent>
    </Card>
  )
}
