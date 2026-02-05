'use client'

import { useState, useEffect } from 'react'
import { SEODashboardContainer } from './dashboard/SEODashboardContainer'
import { SimpleSEODashboard } from './dashboard/SimpleSEODashboard'

interface SEODashboardProps {
  className?: string
}

export function SEODashboard({ className = '' }: SEODashboardProps) {
  const [useSimple, setUseSimple] = useState(false)

  useEffect(() => {
    // Check if we should use simple dashboard (fallback for cookie issues)
    const checkSimpleMode = () => {
      // You can add logic here to detect cookie issues or other problems
      // For now, we'll use the complex version by default
      setUseSimple(false)
    }
    
    checkSimpleMode()
  }, [])

  if (useSimple) {
    return <SimpleSEODashboard className={className} />
  }

  return <SEODashboardContainer className={className} />
}