'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, FileText } from 'lucide-react'
import { pdfService } from '@/lib/pdf/pdf-service'
import { toast } from 'sonner'

interface PDFReportButtonProps {
  auditData: Record<string, unknown>
  className?: string
  filename?: string
}

export function PDFReportButton({ 
  auditData, 
  className = '',
  filename = 'seo-audit-report'
}: PDFReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true)
      
      // Show loading toast
      toast.loading('Generating PDF report...', {
        id: 'pdf-generation'
      })

      // Generate and download PDF
      await pdfService.generateAndDownloadSEOReport(auditData, filename)

      // Show success toast
      toast.success('PDF report downloaded successfully!', {
        id: 'pdf-generation'
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      
      // Show error toast
      toast.error('Failed to generate PDF report. Please try again.', {
        id: 'pdf-generation'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      className={className}
      variant="outline"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <FileText className="h-4 w-4 mr-2" />
      )}
      {isGenerating ? 'Generating PDF...' : 'Download PDF Report'}
    </Button>
  )
}
