'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Screen width breakpoints
const MOBILE_BREAKPOINT = 768 // 768px and below = mobile/tablet
const TABLET_BREAKPOINT = 1024 // 1024px and below = tablet

export default function DeviceDetectionLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [lastDeviceType, setLastDeviceType] = useState<'mobile' | 'desktop' | null>(null)
  const router = useRouter()
  const isRedirecting = useRef(false)

  // Function to detect device type
  function detectDeviceType() {
    const width = window.innerWidth
    const height = window.innerHeight
    
    // Check user agent
    const userAgent = navigator.userAgent
    const isMobileByUserAgent = /iPhone|iPad|Android|Mobile|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    
    // Determine device type
    const isMobileBySize = width <= MOBILE_BREAKPOINT
    const isTabletBySize = width > MOBILE_BREAKPOINT && width <= TABLET_BREAKPOINT
    
    const mobile = isMobileBySize || isMobileByUserAgent
    const tablet = isTabletBySize || (isMobileByUserAgent && /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent))
    
    const shouldUseMobile = mobile || tablet
    const deviceType: 'mobile' | 'desktop' = shouldUseMobile ? 'mobile' : 'desktop'
    
    return { shouldUseMobile, deviceType, width, height, userAgent }
  }

  // Function to handle layout changes
  const handleLayoutChange = useCallback((shouldUseMobile: boolean, deviceType: 'mobile' | 'desktop') => {
    // Prevent multiple redirects
    if (isRedirecting.current) return
    
    const path = window.location.pathname
    const isOnMobileRoute = path.startsWith('/m')
    const isOnWebRoute = !isOnMobileRoute && !path.startsWith('/admin') && !path.startsWith('/api')
    
    // Exclude authentication pages from device detection redirects
    const isAuthPage = path.startsWith('/users/') || 
                      path.startsWith('/admin/login') || 
                      path.startsWith('/agent/login') ||
                      path === '/login' ||
                      path === '/register' ||
                      path === '/signup'
    
    // Don't redirect if user is on an authentication page
    if (isAuthPage) {
      setLastDeviceType(deviceType)
      return
    }
    
    if (shouldUseMobile && isOnWebRoute) {
      isRedirecting.current = true
      router.push('/m')
    } else if (!shouldUseMobile && isOnMobileRoute) {
      isRedirecting.current = true
      router.push('/')
    }
  
    setLastDeviceType(deviceType)
    
    // Reset redirecting flag after a delay
    setTimeout(() => {
      isRedirecting.current = false
    }, 1000)
  }, [router])

  // Initial load logic
  useEffect(() => {
    function handleInitialLoad() {
      const { shouldUseMobile, deviceType } = detectDeviceType()
      
      // Handle initial layout
      handleLayoutChange(shouldUseMobile, deviceType)
      
      // Stop loading after delay
      setTimeout(() => {
        setIsLoading(false)
        setIsInitialLoad(false)
      }, 1500)
    }

    // Small delay to ensure window is available
    const timer = setTimeout(() => {
      handleInitialLoad()
    }, 100)

    // Fallback: stop loading after 3 seconds max
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false)
      setIsInitialLoad(false)
    }, 3000)

    return () => {
      clearTimeout(timer)
      clearTimeout(fallbackTimer)
    }
  }, [handleLayoutChange])

  // Screen size change logic
  useEffect(() => {
    if (isInitialLoad) return // Skip during initial load
    
    function handleScreenSizeChange() {
      const { shouldUseMobile, deviceType } = detectDeviceType()
      
      // Only handle if device type actually changed
      if (deviceType !== lastDeviceType && lastDeviceType !== null) {
        // Instant layout change (no loading screen)
        handleLayoutChange(shouldUseMobile, deviceType)
      }
    }

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        handleScreenSizeChange()
      }, 300) // 300ms debounce
    }

    // Listen for resize and orientation changes
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [handleLayoutChange, lastDeviceType, isInitialLoad])

  // Show loading spinner only during initial load
  if (isLoading && isInitialLoad) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  // Render children (either initial load complete or screen size change)
  return <>{children}</>
} 