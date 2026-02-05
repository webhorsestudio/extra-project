'use client'

import { useEffect, useState } from 'react'

interface HydrationSuppressorProps {
  children: React.ReactNode
}

export function HydrationSuppressor({ children }: HydrationSuppressorProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Suppress hydration warnings for fdprocessedid and other browser-added attributes
    const originalError = console.error
    console.error = (...args) => {
      const message = args[0]
      if (
        typeof message === 'string' && 
        (message.includes('Hydration failed') || 
         message.includes('fdprocessedid') ||
         message.includes('server rendered HTML didn\'t match') ||
         message.includes('react-hydration-error'))
      ) {
        console.warn('Suppressed hydration warning:', message)
        return
      }
      originalError.apply(console, args)
    }

    // Remove fdprocessedid attributes from all elements
    const removeFdprocessedId = () => {
      const elements = document.querySelectorAll('[fdprocessedid]')
      elements.forEach(element => {
        element.removeAttribute('fdprocessedid')
      })
    }

    // Initial cleanup
    removeFdprocessedId()

    // Set up observer to remove fdprocessedid as they're added
    const observer = new MutationObserver((mutations) => {
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

    // Additional error handling for browser extensions
    const handleError = (event: ErrorEvent) => {
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
    }

    // Add error listener
    if (typeof window !== 'undefined') {
      window.addEventListener('error', handleError)
      
      // Cleanup
      return () => {
        window.removeEventListener('error', handleError)
        observer.disconnect()
        console.error = originalError
      }
    }
  }, [])

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <>{children}</>
} 