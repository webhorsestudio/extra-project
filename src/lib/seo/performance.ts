/**
 * Performance optimization utilities for Core Web Vitals and SEO
 */

/**
 * Core Web Vitals thresholds
 */
export const CORE_WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
}

/**
 * Performance optimization strategies
 */
export interface PerformanceOptimization {
  imageOptimization: boolean
  lazyLoading: boolean
  preloading: boolean
  codeSplitting: boolean
  caching: boolean
  compression: boolean
}

/**
 * Generate performance optimization recommendations
 */
export function generatePerformanceRecommendations(
  metrics: {
    lcp?: number
    fid?: number
    cls?: number
    fcp?: number
    ttfb?: number
  }
): {
  score: 'good' | 'needs-improvement' | 'poor'
  recommendations: string[]
  priority: 'high' | 'medium' | 'low'
} {
  const recommendations: string[] = []
  let score: 'good' | 'needs-improvement' | 'poor' = 'good'
  let priority: 'high' | 'medium' | 'low' = 'low'

  // LCP optimization
  if (metrics.lcp) {
    if (metrics.lcp > CORE_WEB_VITALS_THRESHOLDS.LCP.needsImprovement) {
      score = 'poor'
      priority = 'high'
      recommendations.push('Optimize Largest Contentful Paint (LCP) - consider image optimization, preloading critical resources, and server response time')
    } else if (metrics.lcp > CORE_WEB_VITALS_THRESHOLDS.LCP.good) {
      score = 'needs-improvement'
      priority = 'medium'
      recommendations.push('Improve Largest Contentful Paint (LCP) - optimize images and reduce server response time')
    }
  }

  // FID optimization
  if (metrics.fid) {
    if (metrics.fid > CORE_WEB_VITALS_THRESHOLDS.FID.needsImprovement) {
      score = 'poor'
      priority = 'high'
      recommendations.push('Optimize First Input Delay (FID) - reduce JavaScript execution time and break up long tasks')
    } else if (metrics.fid > CORE_WEB_VITALS_THRESHOLDS.FID.good) {
      score = 'needs-improvement'
      priority = 'medium'
      recommendations.push('Improve First Input Delay (FID) - optimize JavaScript and reduce main thread blocking')
    }
  }

  // CLS optimization
  if (metrics.cls) {
    if (metrics.cls > CORE_WEB_VITALS_THRESHOLDS.CLS.needsImprovement) {
      score = 'poor'
      priority = 'high'
      recommendations.push('Optimize Cumulative Layout Shift (CLS) - reserve space for images and avoid dynamically injected content')
    } else if (metrics.cls > CORE_WEB_VITALS_THRESHOLDS.CLS.good) {
      score = 'needs-improvement'
      priority = 'medium'
      recommendations.push('Improve Cumulative Layout Shift (CLS) - ensure stable layout and proper image dimensions')
    }
  }

  // FCP optimization
  if (metrics.fcp) {
    if (metrics.fcp > CORE_WEB_VITALS_THRESHOLDS.FCP.needsImprovement) {
      if (score !== 'poor') score = 'needs-improvement'
      if (priority !== 'high') priority = 'medium'
      recommendations.push('Optimize First Contentful Paint (FCP) - minimize render-blocking resources and optimize CSS')
    }
  }

  // TTFB optimization
  if (metrics.ttfb) {
    if (metrics.ttfb > CORE_WEB_VITALS_THRESHOLDS.TTFB.needsImprovement) {
      if (score !== 'poor') score = 'needs-improvement'
      if (priority !== 'high') priority = 'medium'
      recommendations.push('Optimize Time to First Byte (TTFB) - improve server response time and use CDN')
    }
  }

  return { score, recommendations, priority }
}

/**
 * Generate resource hints for performance optimization
 */
export function generateResourceHints(
  resources: {
    preload?: string[]
    prefetch?: string[]
    preconnect?: string[]
    dnsPrefetch?: string[]
  }
): Array<{
  rel: string
  href: string
  as?: string
  type?: string
}> {
  const hints: Array<{
    rel: string
    href: string
    as?: string
    type?: string
  }> = []

  // Preload critical resources
  resources.preload?.forEach(resource => {
    const as = getResourceType(resource)
    hints.push({
      rel: 'preload',
      href: resource,
      as,
      type: getMimeType(resource),
    })
  })

  // Prefetch likely next resources
  resources.prefetch?.forEach(resource => {
    hints.push({
      rel: 'prefetch',
      href: resource,
    })
  })

  // Preconnect to external domains
  resources.preconnect?.forEach(domain => {
    hints.push({
      rel: 'preconnect',
      href: domain,
    })
  })

  // DNS prefetch for external domains
  resources.dnsPrefetch?.forEach(domain => {
    hints.push({
      rel: 'dns-prefetch',
      href: domain,
    })
  })

  return hints
}

/**
 * Get resource type for preload
 */
function getResourceType(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'css':
      return 'style'
    case 'js':
      return 'script'
    case 'woff':
    case 'woff2':
    case 'ttf':
    case 'otf':
      return 'font'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'webp':
    case 'avif':
      return 'image'
    case 'mp4':
    case 'webm':
      return 'video'
    default:
      return 'fetch'
  }
}

/**
 * Get MIME type for resource
 */
function getMimeType(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'css':
      return 'text/css'
    case 'js':
      return 'application/javascript'
    case 'woff':
      return 'font/woff'
    case 'woff2':
      return 'font/woff2'
    case 'ttf':
      return 'font/ttf'
    case 'otf':
      return 'font/otf'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'avif':
      return 'image/avif'
    case 'mp4':
      return 'video/mp4'
    case 'webm':
      return 'video/webm'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Generate critical CSS for above-the-fold content
 */
export function generateCriticalCSS(): string {
  return `
    /* Critical CSS for above-the-fold content */
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    .header { position: sticky; top: 0; z-index: 50; }
    .hero { min-height: 100vh; display: flex; align-items: center; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    .btn { display: inline-block; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; }
    .btn-primary { background-color: #3b82f6; color: white; }
    .btn-primary:hover { background-color: #2563eb; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .text-xl { font-size: 1.25rem; }
    .text-2xl { font-size: 1.5rem; }
    .text-3xl { font-size: 1.875rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    .hidden { display: none; }
    .block { display: block; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .w-full { width: 100%; }
    .h-full { height: 100%; }
    .min-h-screen { min-height: 100vh; }
    .bg-white { background-color: white; }
    .bg-gray-50 { background-color: #f9fafb; }
    .text-gray-900 { color: #111827; }
    .text-gray-600 { color: #4b5563; }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-2xl { border-radius: 1rem; }
    .rounded-3xl { border-radius: 1.5rem; }
    
    /* Responsive breakpoints */
    @media (min-width: 768px) {
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .md\\:text-xl { font-size: 1.25rem; }
      .md\\:text-2xl { font-size: 1.5rem; }
      .md\\:text-3xl { font-size: 1.875rem; }
    }
    
    @media (min-width: 1024px) {
      .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .lg\\:text-2xl { font-size: 1.5rem; }
      .lg\\:text-3xl { font-size: 1.875rem; }
      .lg\\:text-4xl { font-size: 2.25rem; }
    }
  `
}

/**
 * Generate service worker for caching
 */
export function generateServiceWorker(): string {
  return `
    const CACHE_NAME = 'extra-realty-v1'
    const urlsToCache = [
      '/',
      '/properties',
      '/public-listings',
      '/blog',
      '/static/css/main.css',
      '/static/js/main.js',
      '/images/logo.png',
      '/images/og-default.jpg'
    ]

    self.addEventListener('install', event => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => cache.addAll(urlsToCache))
      )
    })

    self.addEventListener('fetch', event => {
      event.respondWith(
        caches.match(event.request)
          .then(response => {
            if (response) {
              return response
            }
            return fetch(event.request)
          })
      )
    })
  `
}

/**
 * Generate performance budget recommendations
 */
export function generatePerformanceBudget(): {
  budgets: Array<{
    resourceType: string
    budget: number
    unit: string
    description: string
  }>
  recommendations: string[]
} {
  const budgets = [
    {
      resourceType: 'Total Page Size',
      budget: 2000,
      unit: 'KB',
      description: 'Total size of all resources on the page'
    },
    {
      resourceType: 'JavaScript',
      budget: 500,
      unit: 'KB',
      description: 'Total JavaScript bundle size'
    },
    {
      resourceType: 'CSS',
      budget: 100,
      unit: 'KB',
      description: 'Total CSS bundle size'
    },
    {
      resourceType: 'Images',
      budget: 1000,
      unit: 'KB',
      description: 'Total image size on the page'
    },
    {
      resourceType: 'Fonts',
      budget: 100,
      unit: 'KB',
      description: 'Total font file size'
    },
    {
      resourceType: 'Third-party Scripts',
      budget: 200,
      unit: 'KB',
      description: 'Total third-party JavaScript size'
    }
  ]

  const recommendations = [
    'Use code splitting to load only necessary JavaScript',
    'Optimize images with modern formats (WebP, AVIF)',
    'Minimize and compress CSS and JavaScript',
    'Use font-display: swap for web fonts',
    'Lazy load non-critical images and content',
    'Remove unused CSS and JavaScript',
    'Use a CDN for static assets',
    'Implement proper caching strategies',
    'Minimize third-party scripts',
    'Use critical CSS for above-the-fold content'
  ]

  return { budgets, recommendations }
}

/**
 * Generate Core Web Vitals monitoring script
 */
export function generateWebVitalsScript(): string {
  return `
    // Core Web Vitals monitoring
    function sendToAnalytics(metric) {
      // Send to Google Analytics 4
      if (typeof gtag !== 'undefined') {
        gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        })
      }
      
      // Send to custom analytics endpoint
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta,
          navigationType: metric.navigationType,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(console.error)
    }

    // Import and use web-vitals library
    import('https://unpkg.com/web-vitals@3/dist/web-vitals.attribution.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(sendToAnalytics)
      getFID(sendToAnalytics)
      getFCP(sendToAnalytics)
      getLCP(sendToAnalytics)
      getTTFB(sendToAnalytics)
    })
  `
}
