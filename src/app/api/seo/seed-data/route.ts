import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  try {
    const supabase = await createSupabaseAdminClient()

    // Seed SEO monitoring data
    const monitoringData = [
      {
        url: '/',
        page_views: 1250,
        unique_visitors: 980,
        bounce_rate: 45.2,
        average_session_duration: 180.5,
        organic_traffic: 850,
        backlinks: 125,
        domain_authority: 42,
        indexed_pages: 45,
        crawl_errors: 2,
        page_speed_mobile: 78,
        page_speed_desktop: 92,
        lcp: 2.1,
        fid: 45,
        cls: 0.05,
        fcp: 1.8,
        ttfb: 800,
        keyword_rankings: [
          { keyword: 'real estate', position: 3, search_volume: 1200 },
          { keyword: 'properties for sale', position: 5, search_volume: 800 },
          { keyword: 'luxury homes', position: 7, search_volume: 600 }
        ],
        issues: []
      },
      {
        url: '/properties',
        page_views: 890,
        unique_visitors: 720,
        bounce_rate: 38.5,
        average_session_duration: 220.3,
        organic_traffic: 650,
        backlinks: 95,
        domain_authority: 42,
        indexed_pages: 45,
        crawl_errors: 1,
        page_speed_mobile: 82,
        page_speed_desktop: 88,
        lcp: 1.9,
        fid: 38,
        cls: 0.03,
        fcp: 1.6,
        ttfb: 750,
        keyword_rankings: [
          { keyword: 'apartments for rent', position: 4, search_volume: 900 },
          { keyword: 'commercial properties', position: 6, search_volume: 400 }
        ],
        issues: []
      },
      {
        url: '/about',
        page_views: 450,
        unique_visitors: 380,
        bounce_rate: 52.1,
        average_session_duration: 150.2,
        organic_traffic: 320,
        backlinks: 45,
        domain_authority: 42,
        indexed_pages: 45,
        crawl_errors: 0,
        page_speed_mobile: 85,
        page_speed_desktop: 90,
        lcp: 1.7,
        fid: 35,
        cls: 0.02,
        fcp: 1.4,
        ttfb: 680,
        keyword_rankings: [
          { keyword: 'about us', position: 2, search_volume: 200 },
          { keyword: 'company info', position: 8, search_volume: 150 }
        ],
        issues: []
      }
    ]

    // Insert monitoring data
    const { data: insertedMonitoring, error: monitoringError } = await supabase
      .from('seo_monitoring_data')
      .insert(monitoringData)

    if (monitoringError) {
      console.error('Error inserting monitoring data:', monitoringError)
    }

    // Seed keyword rankings
    const keywordData = [
      { keyword: 'real estate', position: 3, search_volume: 1200, url: '/', date: new Date().toISOString().split('T')[0] },
      { keyword: 'properties for sale', position: 5, search_volume: 800, url: '/', date: new Date().toISOString().split('T')[0] },
      { keyword: 'luxury homes', position: 7, search_volume: 600, url: '/', date: new Date().toISOString().split('T')[0] },
      { keyword: 'apartments for rent', position: 4, search_volume: 900, url: '/properties', date: new Date().toISOString().split('T')[0] },
      { keyword: 'commercial properties', position: 6, search_volume: 400, url: '/properties', date: new Date().toISOString().split('T')[0] },
      { keyword: 'about us', position: 2, search_volume: 200, url: '/about', date: new Date().toISOString().split('T')[0] },
      { keyword: 'company info', position: 8, search_volume: 150, url: '/about', date: new Date().toISOString().split('T')[0] }
    ]

    const { data: insertedKeywords, error: keywordsError } = await supabase
      .from('seo_keyword_rankings')
      .insert(keywordData)

    if (keywordsError) {
      console.error('Error inserting keyword data:', keywordsError)
    }

    // Seed SEO events
    const eventsData = [
      {
        event: 'page_view',
        url: '/',
        session_id: 'session_1',
        referrer: 'google.com',
        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        event: 'page_view',
        url: '/properties',
        session_id: 'session_1',
        referrer: 'google.com',
        timestamp: new Date(Date.now() - 3500000).toISOString()
      },
      {
        event: 'conversion',
        url: '/contact',
        session_id: 'session_1',
        referrer: 'google.com',
        timestamp: new Date(Date.now() - 3400000).toISOString()
      },
      {
        event: 'page_view',
        url: '/',
        session_id: 'session_2',
        referrer: 'direct',
        timestamp: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
      },
      {
        event: 'page_view',
        url: '/about',
        session_id: 'session_3',
        referrer: 'facebook.com',
        timestamp: new Date(Date.now() - 900000).toISOString() // 15 minutes ago
      }
    ]

    const { data: insertedEvents, error: eventsError } = await supabase
      .from('seo_events')
      .insert(eventsData)

    if (eventsError) {
      console.error('Error inserting events data:', eventsError)
    }

    // Seed SEO alerts
    const alertsData = [
      {
        alert_type: 'performance',
        severity: 'medium',
        title: 'Page Speed Warning',
        message: 'Mobile page speed is below 80 for /properties page',
        url: '/properties',
        threshold_value: 80,
        current_value: 78,
        metric_name: 'page_speed_mobile',
        status: 'active'
      },
      {
        alert_type: 'technical',
        severity: 'low',
        title: 'Missing Meta Description',
        message: 'Some pages are missing meta descriptions',
        url: '/contact',
        threshold_value: 1,
        current_value: 0,
        metric_name: 'meta_description',
        status: 'active'
      }
    ]

    const { data: insertedAlerts, error: alertsError } = await supabase
      .from('seo_alerts')
      .insert(alertsData)

    if (alertsError) {
      console.error('Error inserting alerts data:', alertsError)
    }

    return NextResponse.json({
      success: true,
      message: 'SEO data seeded successfully',
      data: {
        monitoringRecords: (insertedMonitoring as unknown as unknown[])?.length || 0,
        keywordRecords: (insertedKeywords as unknown as unknown[])?.length || 0,
        eventRecords: (insertedEvents as unknown as unknown[])?.length || 0,
        alertRecords: (insertedAlerts as unknown as unknown[])?.length || 0
      }
    })
  } catch (error) {
    console.error('Error seeding SEO data:', error)
    return NextResponse.json(
      { error: 'Failed to seed SEO data' },
      { status: 500 }
    )
  }
}
