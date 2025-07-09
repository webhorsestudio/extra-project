'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, BookOpen } from 'lucide-react'

interface BlogErrorFallbackProps {
  error: Error
  resetError: () => void
}

export default function BlogErrorFallback({ error, resetError }: BlogErrorFallbackProps) {
  return (
    <div className="py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <BookOpen className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Blog Loading Error</h3>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            We couldn&apos;t load the latest blog posts at the moment.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={resetError} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.href = '/blogs'} 
              size="sm"
            >
              View All Blogs
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left mt-4">
              <summary className="cursor-pointer text-xs font-medium text-gray-500">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-gray-400 overflow-auto bg-gray-50 p-2 rounded">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 