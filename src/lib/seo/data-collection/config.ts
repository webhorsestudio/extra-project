// Configuration for SEO data collection
export const SEO_COLLECTION_CONFIG = {
  // URLs to monitor (replace with your actual domain)
  urls: [
    'https://your-domain.com',
    'https://your-domain.com/properties',
    'https://your-domain.com/about',
    'https://your-domain.com/contact',
    'https://your-domain.com/blog'
  ],
  
  // Collection intervals (in minutes)
  intervals: {
    pageSpeed: 60,      // Collect PageSpeed data every hour
    analytics: 30,      // Collect analytics data every 30 minutes
    alerts: 15          // Check for alerts every 15 minutes
  },
  
  // Performance thresholds
  thresholds: {
    lcp: 2.5,           // Largest Contentful Paint (seconds)
    fid: 100,           // First Input Delay (milliseconds)
    cls: 0.1,           // Cumulative Layout Shift
    fcp: 1.8,           // First Contentful Paint (seconds)
    ttfb: 800,          // Time to First Byte (milliseconds)
    pageSpeedMobile: 50, // Mobile Page Speed score
    pageSpeedDesktop: 70, // Desktop Page Speed score
    organicTraffic: 100  // Minimum organic traffic
  },
  
  // API configuration
  apis: {
    pageSpeed: {
      enabled: true,
      apiKey: process.env.GOOGLE_PAGESPEED_API_KEY,
      rateLimit: 100 // requests per day
    },
    analytics: {
      enabled: true,
      // Add other analytics API configurations here
    }
  }
}

// Helper function to get URLs for a specific environment
export function getUrlsForEnvironment(environment: 'development' | 'staging' | 'production'): string[] {
  const baseUrls = {
    development: [
      'http://localhost:3000',
      'http://localhost:3000/properties',
      'http://localhost:3000/about',
      'http://localhost:3000/contact'
    ],
    staging: [
      'https://staging.your-domain.com',
      'https://staging.your-domain.com/properties',
      'https://staging.your-domain.com/about',
      'https://staging.your-domain.com/contact'
    ],
    production: SEO_COLLECTION_CONFIG.urls
  }
  
  return baseUrls[environment] || baseUrls.production
}
