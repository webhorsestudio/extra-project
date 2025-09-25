import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { detectDeviceFromUserAgent, extractSlugFromPropertyUrl } from '@/lib/device-detection'

// UUID regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''
  const forceMobile = searchParams.get('mobile') === 'true' // For testing
  const clientRedirect = searchParams.get('client') === 'true' // Client-side redirect indicator
  
  // Use unified device detection
  const deviceInfo = detectDeviceFromUserAgent(userAgent)
  const isMobile = deviceInfo.isMobile || forceMobile
  
  console.log('🚀 MIDDLEWARE:', pathname)
  console.log('📱 Device Detection:', { 
    deviceType: deviceInfo.deviceType, 
    isMobile, 
    forceMobile, 
    userAgent: userAgent.substring(0, 50) + '...' 
  })

  // Skip device detection for admin, API, and auth routes
  const isAdminRoute = pathname.startsWith('/admin')
  const isApiRoute = pathname.startsWith('/api')
  const isAuthRoute = pathname.startsWith('/users/') ||
                     pathname.startsWith('/login') ||
                     pathname.startsWith('/register') ||
                     pathname.startsWith('/signup')

  if (isAdminRoute || isApiRoute || isAuthRoute) {
    return NextResponse.next()
  }

  // Handle UUID→slug redirections first
  const propertyMatch = pathname.match(/^\/properties\/([^\/]+)$/)
  if (propertyMatch) {
    const identifier = propertyMatch[1]
    if (UUID_REGEX.test(identifier)) {
      // For now, just redirect to properties listing
      // In production, you'd fetch the slug from database
      return NextResponse.redirect(new URL('/properties', request.url), 302)
    }
  }

  const mobilePropertyMatch = pathname.match(/^\/m\/properties\/([^\/]+)$/)
  if (mobilePropertyMatch) {
    const identifier = mobilePropertyMatch[1]
    if (UUID_REGEX.test(identifier)) {
      // For now, just redirect to mobile properties listing
      return NextResponse.redirect(new URL('/m/properties', request.url), 302)
    }
  }

  // Handle device-based redirection using unified logic
  const slug = extractSlugFromPropertyUrl(pathname)
  
  if (slug) {
    // Skip device-based redirection if this is a client-side redirect
    if (clientRedirect) {
      console.log('🔄 Middleware: Client-side redirect detected, skipping server-side redirection')
      return NextResponse.next()
    }
    
    // Mobile device accessing web route -> redirect to mobile
    if (isMobile && pathname.startsWith('/properties/') && !pathname.startsWith('/m/')) {
      console.log('🔄 Server redirect: Mobile detected, redirecting to:', `/m/properties/${slug}`)
      return NextResponse.redirect(new URL(`/m/properties/${slug}`, request.url), 302)
    }
    
    // Desktop device accessing mobile route -> redirect to web
    if (!isMobile && pathname.startsWith('/m/properties/')) {
      console.log('🔄 Server redirect: Desktop detected, redirecting to:', `/properties/${slug}`)
      return NextResponse.redirect(new URL(`/properties/${slug}`, request.url), 302)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}