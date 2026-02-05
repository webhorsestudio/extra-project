'use client'

import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface SEOAuditButtonProps {
  className?: string
}

export function SEOAuditButton({ className = '' }: SEOAuditButtonProps) {
  const handleRunAudit = () => {
    // Switch to Audit tab in the same page
    const auditTab = document.querySelector('[value="audit"]') as HTMLElement
    if (auditTab) {
      auditTab.click()
    } else {
      // Fallback: try to find audit tab in SEO Configuration page
      const seoConfigTab = document.querySelector('[data-tab="audit"]') as HTMLElement
      if (seoConfigTab) {
        seoConfigTab.click()
      } else {
        // Last resort: show alert
        alert('Please navigate to the SEO Configuration page and use the Audit tab.')
      }
    }
  }

  return (
    <Button 
      className={`w-full justify-start ${className}`}
      variant="outline"
      onClick={handleRunAudit}
    >
      <Search className="h-4 w-4 mr-2" />
      Run SEO Audit
    </Button>
  )
}
