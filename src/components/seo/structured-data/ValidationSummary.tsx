/**
 * Validation Summary Component
 * Displays overall validation metrics and scores
 */

import { Progress } from '@/components/ui/progress'
import { StructuredDataValidationResult } from '@/lib/seo/structured-data/types'

interface ValidationSummaryProps {
  results: StructuredDataValidationResult
}

export function ValidationSummary({ results }: ValidationSummaryProps) {
  const validSchemas = results.validationResults.filter(r => r.status === 'valid').length
  // const totalSchemas = results.validationResults.length

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{results.score}</div>
        <div className="text-sm text-gray-600">Overall Score</div>
        <Progress value={results.score} className="mt-2" />
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{results.totalSchemas}</div>
        <div className="text-sm text-gray-600">Total Schemas</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{results.foundSchemas.length}</div>
        <div className="text-sm text-gray-600">Schema Types</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{validSchemas}</div>
        <div className="text-sm text-gray-600">Valid Schemas</div>
      </div>
    </div>
  )
}
