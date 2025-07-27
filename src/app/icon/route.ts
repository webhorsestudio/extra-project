import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseApiClient()
    const { data, error } = await supabase
      .from('settings')
      .select('favicon_url')
      .single()
    
    if (error) {
      console.error('Error fetching favicon:', error)
      // Fallback to default favicon
      return NextResponse.redirect(new URL('/favicon.ico', request.url))
    }
    
    if (data?.favicon_url) {
      try {
        // Fetch the actual favicon image from the URL
        const faviconResponse = await fetch(data.favicon_url)
        
        if (faviconResponse.ok) {
          const faviconBuffer = await faviconResponse.arrayBuffer()
          const contentType = faviconResponse.headers.get('content-type') || 'image/png'
          
          return new NextResponse(faviconBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            },
          })
        } else {
          console.error('Failed to fetch favicon from URL:', data.favicon_url)
          // Fallback to default favicon
          return NextResponse.redirect(new URL('/favicon.ico', request.url))
        }
      } catch (fetchError) {
        console.error('Error fetching favicon from URL:', fetchError)
        // Fallback to default favicon
        return NextResponse.redirect(new URL('/favicon.ico', request.url))
      }
    } else {
      // No custom favicon configured, fallback to default
      return NextResponse.redirect(new URL('/favicon.ico', request.url))
    }
  } catch (error) {
    console.error('Unexpected error fetching favicon:', error)
    // Fallback to default favicon
    return NextResponse.redirect(new URL('/favicon.ico', request.url))
  }
} 