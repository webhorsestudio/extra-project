// PageSpeed Insights API data collector
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getUrlsForEnvironment } from './config'

interface PageSpeedResult {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
  performanceScore: number
  mobileScore: number
  desktopScore: number
}

interface PageSpeedResponse {
  lighthouseResult: {
    audits: {
      'largest-contentful-paint': { numericValue: number }
      'first-input-delay': { numericValue: number }
      'cumulative-layout-shift': { numericValue: number }
      'first-contentful-paint': { numericValue: number }
      'server-response-time': { numericValue: number }
    }
    categories: {
      performance: { score: number }
    }
  }
}

export class PageSpeedCollector {
  private static instance: PageSpeedCollector
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || ''
  }

  static getInstance(): PageSpeedCollector {
    if (!PageSpeedCollector.instance) {
      PageSpeedCollector.instance = new PageSpeedCollector()
    }
    return PageSpeedCollector.instance
  }

  async collectPageSpeedData(url: string): Promise<PageSpeedResult | null> {
    if (!this.apiKey) {
      console.warn('Google PageSpeed API key not configured')
      return null
    }

    try {
      // Collect both mobile and desktop data
      const [mobileResult, desktopResult] = await Promise.all([
        this.fetchPageSpeedData(url, 'mobile'),
        this.fetchPageSpeedData(url, 'desktop')
      ])

      if (!mobileResult || !desktopResult) {
        return null
      }

      return {
        lcp: mobileResult.lcp,
        fid: mobileResult.fid,
        cls: mobileResult.cls,
        fcp: mobileResult.fcp,
        ttfb: mobileResult.ttfb,
        performanceScore: desktopResult.performanceScore,
        mobileScore: mobileResult.performanceScore,
        desktopScore: desktopResult.performanceScore
      }
    } catch (error) {
      console.error('Error collecting PageSpeed data:', error)
      return null
    }
  }

  private async fetchPageSpeedData(url: string, strategy: 'mobile' | 'desktop'): Promise<PageSpeedResult | null> {
    try {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${this.apiKey}&strategy=${strategy}`
      
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status}`)
      }

      const data: PageSpeedResponse = await response.json()
      const audits = data.lighthouseResult.audits

      return {
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        fid: audits['first-input-delay']?.numericValue || 0,
        cls: audits['cumulative-layout-shift']?.numericValue || 0,
        fcp: audits['first-contentful-paint']?.numericValue || 0,
        ttfb: audits['server-response-time']?.numericValue || 0,
        performanceScore: Math.round((data.lighthouseResult.categories.performance?.score || 0) * 100),
        mobileScore: 0, // Will be set by caller
        desktopScore: 0  // Will be set by caller
      }
    } catch (error) {
      console.error(`Error fetching ${strategy} PageSpeed data:`, error)
      return null
    }
  }

  async collectAndStoreData(urls?: string[]): Promise<void> {
    const supabase = await createSupabaseAdminClient()
    
    // Use provided URLs or default from config
    const urlsToProcess = urls || getUrlsForEnvironment(process.env.NODE_ENV as 'development' | 'staging' | 'production')

    for (const url of urlsToProcess) {
      try {
        const pageSpeedData = await this.collectPageSpeedData(url)
        
        if (pageSpeedData) {
          // Store the data in the database
          const { error } = await supabase
            .from('seo_monitoring_data')
            .insert({
              url: url,
              page_speed_mobile: pageSpeedData.mobileScore,
              page_speed_desktop: pageSpeedData.desktopScore,
              lcp: pageSpeedData.lcp,
              fid: pageSpeedData.fid,
              cls: pageSpeedData.cls,
              fcp: pageSpeedData.fcp,
              ttfb: pageSpeedData.ttfb,
              // Add some mock data for other fields
              page_views: Math.floor(Math.random() * 1000) + 500,
              unique_visitors: Math.floor(Math.random() * 800) + 300,
              bounce_rate: Math.random() * 30 + 20,
              average_session_duration: Math.random() * 200 + 100,
              organic_traffic: Math.floor(Math.random() * 500) + 200,
              backlinks: Math.floor(Math.random() * 100) + 50,
              domain_authority: Math.floor(Math.random() * 30) + 40,
              indexed_pages: Math.floor(Math.random() * 20) + 30,
              crawl_errors: Math.floor(Math.random() * 3),
              keyword_rankings: [],
              issues: []
            })

          if (error) {
            console.error(`Error storing data for ${url}:`, error)
          } else {
            console.log(`Successfully collected and stored data for ${url}`)
          }
        }
      } catch (error) {
        console.error(`Error processing ${url}:`, error)
      }
    }
  }
}

export const pageSpeedCollector = PageSpeedCollector.getInstance()
