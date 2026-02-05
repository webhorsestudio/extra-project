// PDF Service for handling PDF generation and downloads
// import { pdfGenerator } from './pdf-generator'
import { advancedPDFGenerator, PDFReportData } from './advanced-pdf-generator'

export class PDFService {
  private static instance: PDFService

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService()
    }
    return PDFService.instance
  }

  async generateSEOAuditPDF(auditData: Record<string, unknown>): Promise<Blob> {
    // Transform audit data to the advanced PDF format
    const pdfReportData: PDFReportData = {
      title: 'SEO Audit Report',
      url: (auditData.url as string) || window.location.origin,
      timestamp: (auditData.timestamp as string) || new Date().toISOString(),
      score: (auditData.score as number) || 0,
      grade: this.getScoreGrade((auditData.score as number) || 0),
      summary: {
        passedChecks: (auditData.passedChecks as number) || 0,
        failedChecks: (auditData.failedChecks as number) || 0,
        warnings: (auditData.warnings as number) || 0
      },
      issues: Array.isArray(auditData.issues) ? auditData.issues.map((issue: Record<string, unknown>) => ({
        message: (issue.message as string) || (issue.title as string) || (issue.description as string) || 'Issue',
        type: (issue.type as string) || 'info',
        priority: (issue.priority as string) || 'medium',
        recommendation: issue.recommendation as string,
        impact: issue.impact as string,
        effort: issue.effort as string
      })) : [],
      recommendations: Array.isArray(auditData.recommendations) ? auditData.recommendations : [],
      technicalDetails: (auditData.technicalDetails as Record<string, unknown>) || {}
    }

    return await advancedPDFGenerator.generatePDF(pdfReportData)
  }

  private getScoreGrade(score: number): string {
    if (score >= 90) return 'A+'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B'
    if (score >= 60) return 'C'
    if (score >= 50) return 'D'
    return 'F'
  }

  async downloadPDF(blob: Blob, filename: string = 'seo-audit-report'): Promise<void> {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async generateAndDownloadSEOReport(auditData: Record<string, unknown>, filename?: string): Promise<void> {
    try {
      const pdfBlob = await this.generateSEOAuditPDF(auditData)
      await this.downloadPDF(pdfBlob, filename)
    } catch (error) {
      console.error('Error generating PDF report:', error)
      throw new Error('Failed to generate PDF report')
    }
  }
}

export const pdfService = PDFService.getInstance()
