'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Zap, 
  Eye, 
  FileText, 
  Globe, 
  BarChart3, 
  ExternalLink 
} from 'lucide-react'

export function SEOQuickTests() {
  const quickTests = [
    {
      name: 'Google Rich Results',
      description: 'Test structured data and rich snippets',
      icon: Search,
      color: 'text-blue-500',
      url: 'https://search.google.com/test/rich-results'
    },
    {
      name: 'PageSpeed Insights',
      description: 'Analyze page performance and Core Web Vitals',
      icon: Zap,
      color: 'text-green-500',
      url: 'https://pagespeed.web.dev/'
    },
    {
      name: 'Mobile-Friendly Test',
      description: 'Check mobile usability and responsiveness',
      icon: Eye,
      color: 'text-purple-500',
      url: 'https://search.google.com/test/mobile-friendly'
    },
    {
      name: 'Schema Validator',
      description: 'Validate structured data markup',
      icon: FileText,
      color: 'text-orange-500',
      url: 'https://validator.schema.org/'
    },
    {
      name: 'SEO Analyzer',
      description: 'Comprehensive SEO analysis and recommendations',
      icon: Globe,
      color: 'text-red-500',
      url: 'https://www.seoptimer.com/'
    },
    {
      name: 'GTmetrix',
      description: 'Detailed performance analysis and optimization',
      icon: BarChart3,
      color: 'text-indigo-500',
      url: 'https://gtmetrix.com/'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Tests
        </CardTitle>
        <CardDescription>
          Quick access to popular SEO testing tools and validators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickTests.map((test, index) => {
            const IconComponent = test.icon
            return (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <IconComponent className={`w-5 h-5 ${test.color}`} />
                  <h3 className="font-medium">{test.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                <Button size="sm" variant="outline" asChild>
                  <a href={test.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Test Now
                  </a>
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
