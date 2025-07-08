'use client'

import { useEffect, useState } from 'react'

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

export function useSuppressHydrationWarning() {
  const [suppressWarning, setSuppressWarning] = useState(false)

  useEffect(() => {
    // Suppress hydration warnings for fdprocessedid and other browser-added attributes
    const originalError = console.error
    console.error = (...args) => {
      const message = args[0]
      if (
        typeof message === 'string' && 
        (message.includes('Hydration failed') || 
         message.includes('fdprocessedid') ||
         message.includes('server rendered HTML didn\'t match'))
      ) {
        // Suppress hydration warnings for known browser extensions and attributes
        return
      }
      originalError.apply(console, args)
    }

    setSuppressWarning(true)

    return () => {
      console.error = originalError
    }
  }, [])

  return suppressWarning
} 