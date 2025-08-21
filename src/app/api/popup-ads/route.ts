import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = await createSupabaseServerClient()
    
    // Get device type from query params or user agent
    const deviceType = searchParams.get('device') || 'all'
    const currentPath = searchParams.get('path') || '/'
    
    // Build query for active popup ads
    let query = supabase
      .from('popup_ads')
      .select('*')
      .eq('status', 'published')
      .eq('is_active', true)

    // Filter by device type
    if (deviceType === 'mobile') {
      query = query.eq('show_on_mobile', true)
    } else if (deviceType === 'desktop') {
      query = query.eq('show_on_desktop', true)
    } else if (deviceType === 'tablet') {
      query = query.eq('show_on_tablet', true)
    }

    // Filter by target pages if specified
    if (currentPath && currentPath !== '/') {
      query = query.or(`target_pages.cs.{${currentPath}},target_pages.is.null`)
      query = query.not('exclude_pages', 'cs', `{${currentPath}}`)
    }

    // Order by priority and created date
    const { data: popupAds, error } = await query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching popup ads:', error)
      return NextResponse.json(
        { error: 'Failed to fetch popup ads' },
        { status: 500 }
      )
    }

    // Filter and limit results
    const activePopupAds = (popupAds || [])
      .filter(ad => {
        // Check if ad should be shown based on current time
        const now = new Date()
        
        // If start_date is set, check if we're past it
        if (ad.start_date && new Date(ad.start_date) > now) {
          return false
        }
        
        // If end_date is set, check if we're before it
        if (ad.end_date && new Date(ad.end_date) < now) {
          return false
        }
        
        return true
      })
      .slice(0, 5) // Limit to 5 ads to prevent overwhelming the user

    return NextResponse.json({
      popupAds: activePopupAds,
      total: activePopupAds.length
    })
  } catch (error) {
    console.error('Error in popup ads API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
