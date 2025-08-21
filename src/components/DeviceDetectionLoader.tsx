'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DeviceDetectionLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [lastDeviceType, setLastDeviceType] = useState<'mobile' | 'desktop' | null>(null)
  const router = useRouter()
  const isRedirecting = useRef(false)

  // Function to detect device type
  function detectDeviceType() {
    if (typeof window === 'undefined') {
      return { shouldUseMobile: false, deviceType: 'desktop' as const, width: 0, height: 0, userAgent: '' }
    }
    
    const width = window.innerWidth
    const height = window.innerHeight
    const userAgent = navigator.userAgent
    
    // Check if device is mobile or tablet
    const isMobileDevice = /iPhone|iPad|Android|Mobile|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const shouldUseMobile = isMobileDevice || width <= 1024
    
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
    
    // IMPORTANT: Don't redirect if user is already on a mobile route
    // This prevents interference with manual navigation in mobile menu
    if (isOnMobileRoute) {
      setLastDeviceType(deviceType)
      return
    }
    
    // Don't redirect if user is on an authentication page
    if (isAuthPage) {
      setLastDeviceType(deviceType)
      return
    }
    
    // Add a small delay to prevent interference with manual navigation
    setTimeout(() => {
    if (shouldUseMobile && isOnWebRoute) {
      isRedirecting.current = true
      router.push('/m')
    } else if (!shouldUseMobile && isOnMobileRoute) {
      isRedirecting.current = true
      router.push('/')
    }
    }, 100) // Small delay to allow manual navigation to complete
  
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

  // Track navigation state to prevent interference
  useEffect(() => {
    // In Next.js App Router, we can't use router.events
    // Simple timeout-based approach to prevent interference
    return () => {
      // Cleanup if needed
    }
  }, [])

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