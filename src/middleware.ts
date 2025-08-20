import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = /iPhone|iPad|Android|Mobile|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // --- SMART URL SHARING REDIRECTS ---
  
  // IMPORTANT: If user is already on a mobile route (/m/*), NEVER redirect them away
  if (pathname.startsWith('/m/')) {
    // Let mobile users access mobile routes without any redirects
    return NextResponse.next()
  }

  // Special handling for public-listings routes
  if (pathname === '/public-listings' && isMobile) {
    return NextResponse.redirect(new URL('/m/public-listings', request.url))
  }

  // Handle mobile-to-web redirects (desktop users accessing mobile URLs)
  if (pathname.startsWith('/m/') && !isMobile) {
    const webPath = pathname.replace('/m/', '/')
    return NextResponse.redirect(new URL(webPath, request.url))
  }

  // Handle web-to-mobile redirects (mobile users accessing web URLs)
  // Exclude admin, users, and other protected routes
  if (!pathname.startsWith('/m/') && isMobile && 
      !pathname.startsWith('/admin') && 
      !pathname.startsWith('/users') && 
      !pathname.startsWith('/agent') &&
      !pathname.startsWith('/customer') &&
      !pathname.startsWith('/api') &&
      pathname !== '/' &&
      pathname !== '/m') {
    return NextResponse.redirect(new URL('/m' + pathname, request.url))
  }

  // Keep existing root path redirect for mobile devices
  if (pathname === '/' && isMobile) {
    return NextResponse.redirect(new URL('/m', request.url))
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

  // --- GLOBAL ADMIN ROLE CHECK FOR /admin ROUTES ---
  if (pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL('/users/login', request.url));
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/users/login', request.url));
    }
  }
  // --- END ADMIN ROLE CHECK ---

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
     * - favicon (dynamic favicon route)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|favicon).*)',
  ],
} 