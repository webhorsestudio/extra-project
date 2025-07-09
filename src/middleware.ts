import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = /iPhone|iPad|Android|Mobile|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  // Debug logging
  console.log('MIDDLEWARE DEBUG:', { 
    pathname, 
    userAgent: userAgent.substring(0, 100) + '...', 
    isMobile,
    timestamp: new Date().toISOString()
  })

  // Only redirect root path for mobile devices (initial load)
  // Client-side detection will handle responsive changes
  if (pathname === '/' && isMobile) {
    console.log('MIDDLEWARE: Redirecting mobile device from / to /m')
    return NextResponse.redirect(new URL('/m', request.url))
  }

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // For mobile devices, we'll let the page handle the device detection
  // This is just for logging and potential future use
  if (isMobile) {
    console.log('MIDDLEWARE: Mobile/Tablet device detected for:', pathname)
  }

  // Create a response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase server client for auth with Next.js 15 compatible cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          // Next.js 15 compatible cookie setting
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Record<string, unknown>) {
          // Next.js 15 compatible cookie removal
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  try {
    await supabase.auth.getUser()
  } catch (error) {
    console.warn('Auth refresh error in middleware:', error)
  }

  // Set the pathname as a custom header for server components to access
  response.headers.set('x-pathname', pathname)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 