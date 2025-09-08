'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, Image, Link, FileText } from 'lucide-react'

interface SEOAuditTechnicalProps {
  auditResult: {
    score: number
    issues: Record<string, unknown>[]
    recommendations: Record<string, unknown>[]
    summary: Record<string, unknown>
  }
}

export function SEOAuditTechnical({ }: SEOAuditTechnicalProps) {
  // Mock technical analysis data - in real implementation, this would come from the audit
  const technicalData = {
    images: [
      { src: '/image1.jpg', alt: 'Sample image 1' },
      { src: '/image2.jpg', alt: '' },
      { src: '/image3.jpg', alt: 'Sample image 3' }
    ],
    links: [
      { href: '/internal1', text: 'Internal Link 1', isExternal: false },
      { href: '/internal2', text: 'Internal Link 2', isExternal: false },
      { href: 'https://external.com', text: 'External Link', isExternal: true }
    ],
    headings: [
      { level: 1, text: 'Main Heading' },
      { level: 2, text: 'Sub Heading 1' },
      { level: 2, text: 'Sub Heading 2' },
      { level: 3, text: 'Sub Sub Heading' }
    ]
  }

  const imagesWithAlt = technicalData.images.filter(img => img.alt)
  const imagesWithoutAlt = technicalData.images.filter(img => !img.alt)
  const internalLinks = technicalData.links.filter(link => !link.isExternal)
  const externalLinks = technicalData.links.filter(link => link.isExternal)

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
                <p className="text-2xl font-bold text-gray-900">{technicalData.images.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">With Alt Text</p>
                <p className="text-2xl font-bold text-green-600">{imagesWithAlt.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Missing Alt Text</p>
                <p className="text-2xl font-bold text-red-600">{imagesWithoutAlt.length}</p>
              </div>
            </div>
            {technicalData.images.length > 0 && (
              <div className="space-y-2">
                {technicalData.images.map((image, index) => (
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
              <p className="text-2xl font-bold text-blue-600">{internalLinks.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">External Links</p>
              <p className="text-2xl font-bold text-green-600">{externalLinks.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Headings Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Headings Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">H1 Tags</p>
                <p className="text-2xl font-bold text-gray-900">
                  {technicalData.headings.filter(h => h.level === 1).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">H2 Tags</p>
                <p className="text-2xl font-bold text-gray-900">
                  {technicalData.headings.filter(h => h.level === 2).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">H3 Tags</p>
                <p className="text-2xl font-bold text-gray-900">
                  {technicalData.headings.filter(h => h.level === 3).length}
                </p>
              </div>
            </div>
            {technicalData.headings.length > 0 && (
              <div className="space-y-2">
                {technicalData.headings.map((heading, index) => (
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
