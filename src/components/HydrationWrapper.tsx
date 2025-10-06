'use client'

import { useEffect, useState, useRef } from 'react'

interface HydrationWrapperProps {
  children: React.ReactNode
}

export function HydrationWrapper({ children }: HydrationWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Only run once when component mounts
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Store original console.error safely
    const originalError = console.error
    
    // Safe console.error override that prevents infinite loops
    console.error = (...args) => {
      try {
        const message = args[0]
        if (
          typeof message === 'string' && 
          (message.includes('Hydration failed') || 
           message.includes('fdprocessedid') ||
           message.includes('server rendered HTML didn\'t match') ||
           message.includes('react-hydration-error'))
        ) {
          // Suppress hydration warnings for known browser extensions and attributes
          console.warn('Suppressed hydration warning:', message)
          return
        }
        
        // Call original error function safely
        if (originalError && typeof originalError === 'function') {
          originalError.apply(console, args)
        }
      } catch (error) {
        // If there's an error in the error handler, just log it normally
        console.warn('Error in console.error override:', error)
      }
    }

    // Remove fdprocessedid attributes from all elements
    const removeFdprocessedId = () => {
      try {
        const elements = document.querySelectorAll('[fdprocessedid]')
        elements.forEach(element => {
          element.removeAttribute('fdprocessedid')
        })
      } catch (error) {
        console.warn('Error removing fdprocessedid:', error)
      }
    }

    // Initial cleanup
    removeFdprocessedId()

    // Set up observer to remove fdprocessedid as they're added
    let observer: MutationObserver | null = null
    try {
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'fdprocessedid') {
            const target = mutation.target as Element
            if (target && target.removeAttribute) {
              target.removeAttribute('fdprocessedid')
            }
          }
        })
      })

      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['fdprocessedid'],
        subtree: true
      })
    } catch (error) {
      console.warn('Error setting up MutationObserver:', error)
    }

    // Additional error handling for browser extensions
    const handleError = (event: ErrorEvent) => {
      try {
        // Handle JSON parsing errors from browser extensions
        if (event.error && event.error.message && event.error.message.includes('JSON')) {
          console.warn('JSON parsing error from browser extension caught:', event.error.message)
          event.preventDefault()
          return false
        }
        
        // Handle "undefined" JSON parsing errors specifically
        if (event.message && event.message.includes('"undefined" is not valid JSON')) {
          console.warn('Undefined JSON parsing error caught and suppressed')
          event.preventDefault()
          return false
        }
        
        // Handle chrome extension errors
        if (event.filename && event.filename.includes('chrome-extension')) {
          console.warn('Browser extension error caught and suppressed:', event.message)
          event.preventDefault()
          return false
        }
      } catch (error) {
        console.warn('Error in handleError:', error)
      }
    }

    // Add error listener
    if (typeof window !== 'undefined') {
      window.addEventListener('error', handleError)
    }

    // Set hydrated state
    setIsHydrated(true)

    // Cleanup
    return () => {
      try {
        if (typeof window !== 'undefined') {
          window.removeEventListener('error', handleError)
        }
        if (observer) {
          observer.disconnect()
        }
        // Restore original console.error safely
        if (originalError && typeof originalError === 'function') {
          console.error = originalError
        }
      } catch (error) {
        console.warn('Error in cleanup:', error)
      }
    }
  }, []) // Empty dependency array to run only once

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <>{children}</>
}
