// Main SEO monitoring and data collection orchestrator
import { pageSpeedCollector } from './page-speed-collector'
import { analyticsCollector } from './analytics-collector'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
// import { SEO_COLLECTION_CONFIG } from './config'

export class SEOMonitor {
  private static instance: SEOMonitor
  private isRunning: boolean = false

  static getInstance(): SEOMonitor {
    if (!SEOMonitor.instance) {
      SEOMonitor.instance = new SEOMonitor()
    }
    return SEOMonitor.instance
  }

  async collectAllData(): Promise<void> {
    if (this.isRunning) {
      console.log('SEO data collection already in progress')
      return
    }

    this.isRunning = true
    console.log('Starting SEO data collection...')

    try {
      // Collect PageSpeed data
      console.log('Collecting PageSpeed data...')
      await pageSpeedCollector.collectAndStoreData()

      // Collect Analytics data
      console.log('Collecting Analytics data...')
      await analyticsCollector.collectAndStoreData()

      // Generate SEO alerts based on collected data
      await this.generateAlerts()

      console.log('SEO data collection completed successfully')
    } catch (error) {
      console.error('Error during SEO data collection:', error)
    } finally {
      this.isRunning = false
    }
  }

  private async generateAlerts(): Promise<void> {
    const supabase = await createSupabaseAdminClient()

    try {
      // Get latest performance data
      const { data: latestData, error } = await supabase
        .from('seo_monitoring_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      if (error || !latestData) {
        console.log('No data available for alert generation')
        return
      }

      const alerts = []

      // Check Core Web Vitals
      if (latestData.lcp > 2.5) {
        alerts.push({
          alert_type: 'performance',
          severity: 'high',
          title: 'Poor LCP Performance',
          message: `Largest Contentful Paint is ${latestData.lcp}s, which is above the recommended 2.5s threshold`,
          url: latestData.url,
          threshold_value: 2.5,
          current_value: latestData.lcp,
          metric_name: 'lcp'
        })
      }

      if (latestData.fid > 100) {
        alerts.push({
          alert_type: 'performance',
          severity: 'high',
          title: 'Poor FID Performance',
          message: `First Input Delay is ${latestData.fid}ms, which is above the recommended 100ms threshold`,
          url: latestData.url,
          threshold_value: 100,
          current_value: latestData.fid,
          metric_name: 'fid'
        })
      }

      if (latestData.cls > 0.1) {
        alerts.push({
          alert_type: 'performance',
          severity: 'medium',
          title: 'Poor CLS Performance',
          message: `Cumulative Layout Shift is ${latestData.cls}, which is above the recommended 0.1 threshold`,
          url: latestData.url,
          threshold_value: 0.1,
          current_value: latestData.cls,
          metric_name: 'cls'
        })
      }

      // Check Page Speed scores
      if (latestData.page_speed_mobile < 50) {
        alerts.push({
          alert_type: 'performance',
          severity: 'high',
          title: 'Poor Mobile Page Speed',
          message: `Mobile Page Speed score is ${latestData.page_speed_mobile}, which is below the recommended 50 threshold`,
          url: latestData.url,
          threshold_value: 50,
          current_value: latestData.page_speed_mobile,
          metric_name: 'page_speed_mobile'
        })
      }

      if (latestData.page_speed_desktop < 70) {
        alerts.push({
          alert_type: 'performance',
          severity: 'medium',
          title: 'Poor Desktop Page Speed',
          message: `Desktop Page Speed score is ${latestData.page_speed_desktop}, which is below the recommended 70 threshold`,
          url: latestData.url,
          threshold_value: 70,
          current_value: latestData.page_speed_desktop,
          metric_name: 'page_speed_desktop'
        })
      }

      // Check organic traffic
      if (latestData.organic_traffic < 100) {
        alerts.push({
          alert_type: 'traffic',
          severity: 'low',
          title: 'Low Organic Traffic',
          message: `Organic traffic is ${latestData.organic_traffic}, which is below the recommended 100 threshold`,
          url: latestData.url,
          threshold_value: 100,
          current_value: latestData.organic_traffic,
          metric_name: 'organic_traffic'
        })
      }

      // Insert alerts if any
      if (alerts.length > 0) {
        const { error: alertError } = await supabase
          .from('seo_alerts')
          .insert(alerts)

        if (alertError) {
          console.error('Error inserting alerts:', alertError)
        } else {
          console.log(`Generated ${alerts.length} SEO alerts`)
        }
      }
    } catch (error) {
      console.error('Error generating alerts:', error)
    }
  }

  async startMonitoring(intervalMinutes: number = 60): Promise<void> {
    console.log(`Starting SEO monitoring with ${intervalMinutes} minute intervals`)
    
    // Run immediately
    await this.collectAllData()
    
    // Set up interval
    setInterval(async () => {
      await this.collectAllData()
    }, intervalMinutes * 60 * 1000)
  }

  async runOnce(): Promise<void> {
    await this.collectAllData()
  }
}

export const seoMonitor = SEOMonitor.getInstance()
