/**
 * Validation Results Component
 * Displays detailed validation results for each schema
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { SchemaValidationResult } from '@/lib/seo/structured-data/types'

interface ValidationResultsProps {
  results: SchemaValidationResult[]
}

export function ValidationResults({ results }: ValidationResultsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'invalid':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <Info className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      valid: 'default',
      invalid: 'destructive',
      warning: 'secondary'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <CardTitle className="text-lg">{result.schema}</CardTitle>
                {getStatusBadge(result.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {result.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Issues Found:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.issues.map((issue, i) => (
                    <li key={i} className="text-sm text-gray-700">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.recommendations.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-blue-600">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.issues.length === 0 && result.recommendations.length === 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">No issues found</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
