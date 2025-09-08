import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase/api'

// UUID regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path matches /properties/[uuid] pattern
  const propertyMatch = pathname.match(/^\/properties\/([^\/]+)$/)
  
  if (propertyMatch) {
    const identifier = propertyMatch[1]
    
    // Check if the identifier is a UUID
    if (UUID_REGEX.test(identifier)) {
      try {
        // Fetch the property by UUID to get its slug
        const supabase = await createSupabaseApiClient()
        const { data: property, error } = await supabase
          .from('properties')
          .select('slug, status')
          .eq('id', identifier)
          .single()

        if (!error && property && property.status === 'active' && property.slug) {
          // Redirect to the slug-based URL
          const newUrl = new URL(`/properties/${property.slug}`, request.url)
          return NextResponse.redirect(newUrl, 301) // Permanent redirect for SEO
        } else {
          // Property not found or inactive, redirect to properties listing
          return NextResponse.redirect(new URL('/properties', request.url), 302)
        }
      } catch (error) {
        console.error('Error fetching property for redirect:', error)
        // On error, redirect to properties listing
        return NextResponse.redirect(new URL('/properties', request.url), 302)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/properties/:path*',
  ],
}