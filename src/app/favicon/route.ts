import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    console.log('Favicon route: Starting favicon fetch')
    const supabase = await createSupabaseApiClient()
    const { data, error } = await supabase
      .from('settings')
      .select('favicon_url')
      .single()
    
    console.log('Favicon route: Database query result:', { data, error })
    
    if (error) {
      console.error('Favicon route: Error fetching favicon:', error)
      // Fallback to default favicon
      return NextResponse.redirect(new URL('/favicon.ico', request.url))
    }
    
    if (data?.favicon_url) {
      console.log('Favicon route: Found favicon URL:', data.favicon_url)
      try {
        // Fetch the actual favicon image from the URL
        const faviconResponse = await fetch(data.favicon_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; FaviconFetcher/1.0)'
          }
        })
        
        if (faviconResponse.ok) {
          const faviconBuffer = await faviconResponse.arrayBuffer()
          let contentType = faviconResponse.headers.get('content-type')
          
          // If no content type is provided, try to determine from URL
          if (!contentType) {
            const url = data.favicon_url.toLowerCase()
            if (url.includes('.ico')) {
              contentType = 'image/x-icon'
            } else if (url.includes('.png')) {
              contentType = 'image/png'
            } else if (url.includes('.svg')) {
              contentType = 'image/svg+xml'
            } else if (url.includes('.jpg') || url.includes('.jpeg')) {
              contentType = 'image/jpeg'
            } else {
              contentType = 'image/x-icon' // Default fallback
            }
          }
          
          console.log('Favicon route: Successfully fetched favicon from URL, content-type:', contentType)
          return new NextResponse(faviconBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
              'ETag': `"favicon-${Date.now()}"`, // Add ETag for cache validation
            },
          })
        } else {
          console.error('Favicon route: Failed to fetch favicon from URL:', data.favicon_url, 'Status:', faviconResponse.status)
          // Fallback to default favicon
          return NextResponse.redirect(new URL('/favicon.ico', request.url))
        }
      } catch (fetchError) {
        console.error('Favicon route: Error fetching favicon from URL:', fetchError)
        // Fallback to default favicon
        return NextResponse.redirect(new URL('/favicon.ico', request.url))
      }
    } else {
      console.log('Favicon route: No custom favicon configured, using default')
      // No custom favicon configured, fallback to default
      return NextResponse.redirect(new URL('/favicon.ico', request.url))
    }
  } catch (error) {
    console.error('Favicon route: Unexpected error fetching favicon:', error)
    // Fallback to default favicon
    return NextResponse.redirect(new URL('/favicon.ico', request.url))
  }
} 