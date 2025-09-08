/**
 * Performance Service
 * Business logic for performance monitoring and calculations
 */

export interface PerformanceMetrics {
  pageSpeed: {
    desktop: number
    mobile: number
  }
  coreWebVitals: {
    lcp: number
    fid: number
    cls: number
    fcp: number
    ttfb: number
  }
  mobileUsability: number
}

export interface PerformanceScores {
  overall: number
  pageSpeed: number
  coreWebVitals: number
  mobileUsability: number
}

export interface PerformanceRecommendation {
  type: 'error' | 'warning' | 'info'
  category: string
  message: string
  suggestion: string
  impact: 'high' | 'medium' | 'low'
}

/**
 * Calculate overall performance score
 */
export function calculateOverallScore(metrics: PerformanceMetrics): number {
  const pageSpeedScore = calculatePageSpeedScore(metrics.pageSpeed)
  const coreWebVitalsScore = calculateCoreWebVitalsScore(metrics.coreWebVitals)
  const mobileUsabilityScore = calculateMobileUsabilityScore(metrics.mobileUsability)
  
  return Math.round((pageSpeedScore + coreWebVitalsScore + mobileUsabilityScore) / 3)
}

/**
 * Calculate page speed score
 */
export function calculatePageSpeedScore(pageSpeed: { desktop: number; mobile: number }): number {
  const { desktop, mobile } = pageSpeed
  
  if (desktop === 0 && mobile === 0) return 0
  
  const avg = (desktop + mobile) / 2
  if (avg >= 90) return 100
  if (avg >= 80) return 80
  if (avg >= 70) return 60
  if (avg >= 50) return 40
  return 20
}

/**
 * Calculate Core Web Vitals score
 */
export function calculateCoreWebVitalsScore(coreWebVitals: PerformanceMetrics['coreWebVitals']): number {
  const { lcp, fid, cls } = coreWebVitals
  
  if (lcp === 0 && fid === 0 && cls === 0) return 0
  
  let score = 0
  
  // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
  if (lcp <= 2.5) score += 40
  else if (lcp <= 4) score += 20
  else score += 0
  
  // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
  if (fid <= 100) score += 30
  else if (fid <= 300) score += 15
  else score += 0
  
  // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
  if (cls <= 0.1) score += 30
  else if (cls <= 0.25) score += 15
  else score += 0
  
  return score
}

/**
 * Calculate mobile usability score
 */
export function calculateMobileUsabilityScore(score: number): number {
  return Math.round(score)
}

/**
 * Generate performance recommendations
 */
export function generatePerformanceRecommendations(
  current: PerformanceMetrics
): PerformanceRecommendation[] {
  const recommendations: PerformanceRecommendation[] = []

  // Page Speed recommendations
  if (current.pageSpeed.desktop < 50) {
    recommendations.push({
      type: 'error',
      category: 'Page Speed',
      message: 'Desktop page speed is very slow',
      suggestion: 'Optimize images, minify CSS/JS, and enable compression',
      impact: 'high'
    })
  } else if (current.pageSpeed.desktop < 80) {
    recommendations.push({
      type: 'warning',
      category: 'Page Speed',
      message: 'Desktop page speed needs improvement',
      suggestion: 'Consider optimizing images and reducing server response time',
      impact: 'medium'
    })
  }

  if (current.pageSpeed.mobile < 50) {
    recommendations.push({
      type: 'error',
      category: 'Mobile Performance',
      message: 'Mobile page speed is very slow',
      suggestion: 'Optimize for mobile: reduce image sizes, minimize CSS/JS',
      impact: 'high'
    })
  }

  // Core Web Vitals recommendations
  if (current.coreWebVitals.lcp > 4) {
    recommendations.push({
      type: 'error',
      category: 'Core Web Vitals',
      message: 'Largest Contentful Paint is too slow',
      suggestion: 'Optimize images, improve server response time, and eliminate render-blocking resources',
      impact: 'high'
    })
  } else if (current.coreWebVitals.lcp > 2.5) {
    recommendations.push({
      type: 'warning',
      category: 'Core Web Vitals',
      message: 'Largest Contentful Paint needs improvement',
      suggestion: 'Consider optimizing images and reducing server response time',
      impact: 'medium'
    })
  }

  if (current.coreWebVitals.fid > 300) {
    recommendations.push({
      type: 'error',
      category: 'Core Web Vitals',
      message: 'First Input Delay is too high',
      suggestion: 'Reduce JavaScript execution time and break up long tasks',
      impact: 'high'
    })
  }

  if (current.coreWebVitals.cls > 0.25) {
    recommendations.push({
      type: 'error',
      category: 'Core Web Vitals',
      message: 'Cumulative Layout Shift is too high',
      suggestion: 'Add size attributes to images and avoid inserting content above existing content',
      impact: 'high'
    })
  }

  // Mobile Usability recommendations
  if (current.mobileUsability < 80) {
    recommendations.push({
      type: 'warning',
      category: 'Mobile Usability',
      message: 'Mobile usability score is low',
      suggestion: 'Ensure touch targets are large enough and text is readable without zooming',
      impact: 'medium'
    })
  }

  return recommendations
}

/**
 * Get Core Web Vitals status
 */
export function getCoreWebVitalsStatus(metric: string, value: number) {
  const thresholds = {
    lcp: { good: 2.5, poor: 4.0 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1.8, poor: 3.0 },
    ttfb: { good: 800, poor: 1800 }
  }

  const threshold = thresholds[metric as keyof typeof thresholds]
  if (!threshold) return { status: 'unknown', color: 'text-gray-500' }

  if (value <= threshold.good) {
    return { status: 'good', color: 'text-green-600' }
  } else if (value <= threshold.poor) {
    return { status: 'needs improvement', color: 'text-yellow-600' }
  } else {
    return { status: 'poor', color: 'text-red-600' }
  }
}
