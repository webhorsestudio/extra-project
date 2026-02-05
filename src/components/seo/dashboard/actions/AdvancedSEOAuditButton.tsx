'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Loader2, CheckCircle } from 'lucide-react'
import { SEOAuditResultsDialog } from '../SEOAuditResultsDialog'

interface AdvancedSEOAuditButtonProps {
  className?: string
  onAuditComplete?: (result: Record<string, unknown>) => void
}

export function AdvancedSEOAuditButton({ 
  className = '', 
  onAuditComplete 
}: AdvancedSEOAuditButtonProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [lastAuditResult, setLastAuditResult] = useState<Record<string, unknown> | null>(null)
  const [showResultsDialog, setShowResultsDialog] = useState(false)

  const handleRunAudit = async () => {
    try {
      setIsRunning(true)
      
      // Run a comprehensive SEO audit
      const response = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: window.location.origin,
          content: document.documentElement.outerHTML,
          targetKeywords: ['real estate', 'properties', 'homes', 'apartments']
        })
      })

      if (response.ok) {
        const result = await response.json()
        setLastAuditResult(result.data)
        
        if (onAuditComplete) {
          onAuditComplete(result.data)
        }
        
        // Show results dialog instead of alert
        setShowResultsDialog(true)
      } else {
        const errorData = await response.json()
        // Show error in dialog as well
        setLastAuditResult({
          score: 0,
          error: errorData.error || 'Unknown error',
          issues: [{ message: errorData.error || 'Unknown error', type: 'error', priority: 'high' }]
        })
        setShowResultsDialog(true)
      }
    } catch (error) {
      console.error('Error running SEO audit:', error)
      // Show error in dialog as well
      setLastAuditResult({
        score: 0,
        error: 'Error running SEO audit. Please try again.',
        issues: [{ message: 'Error running SEO audit. Please try again.', type: 'error', priority: 'high' }]
      })
      setShowResultsDialog(true)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <>
      <Button 
        className={`w-full justify-start ${className}`}
        variant="outline"
        onClick={handleRunAudit}
        disabled={isRunning}
      >
        {isRunning ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : lastAuditResult ? (
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
        ) : (
          <Search className="h-4 w-4 mr-2" />
        )}
        {isRunning ? 'Running Audit...' : lastAuditResult ? 'Audit Complete' : 'Run SEO Audit'}
      </Button>

      <SEOAuditResultsDialog
        isOpen={showResultsDialog}
        onClose={() => setShowResultsDialog(false)}
        auditResult={lastAuditResult}
        onRunNewAudit={() => {
          setShowResultsDialog(false)
          handleRunAudit()
        }}
      />
    </>
  )
}
