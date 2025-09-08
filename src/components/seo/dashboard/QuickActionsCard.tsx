'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, FileText, Settings } from 'lucide-react'

export function QuickActionsCard() {
  const handleRunAudit = () => {
    // Switch to Audit tab in the same page
    const auditTab = document.querySelector('[value="audit"]') as HTMLElement
    if (auditTab) {
      auditTab.click()
    }
  }

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('/api/seo/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'comprehensive',
          period: '30days'
        })
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `seo-report-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to generate report. Please try again.')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
    }
  }

  const handleSEOSettings = () => {
    // Switch to Settings tab in the same page
    const settingsTab = document.querySelector('[value="settings"]') as HTMLElement
    if (settingsTab) {
      settingsTab.click()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={handleRunAudit}
        >
          <Search className="h-4 w-4 mr-2" />
          Run SEO Audit
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={handleGenerateReport}
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={handleSEOSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          SEO Settings
        </Button>
      </CardContent>
    </Card>
  )
}
