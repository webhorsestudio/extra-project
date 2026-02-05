'use client'

import { useCallback } from 'react'

interface EventOptions {
  category?: string
  label?: string
  value?: number
  nonInteraction?: boolean
}

interface EngagementDetails {
  label?: string
  value?: number
}

interface PropertyDetails {
  label?: string
  value?: number
}

export function useAnalytics() {
  // Track page views
  const trackPageView = useCallback((pageTitle?: string, pageLocation?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', window.gtag, {
        page_title: pageTitle || document.title,
        page_location: pageLocation || window.location.href,
      })
    }
  }, [])

  // Track custom events
  const trackEvent = useCallback((
    action: string, 
    options: EventOptions = {}
  ) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: options.category || 'general',
        event_label: options.label,
        value: options.value,
        non_interaction: options.nonInteraction || false,
      })
    }
  }, [])

  // Track user engagement
  const trackEngagement = useCallback((action: string, details?: EngagementDetails) => {
    trackEvent(action, {
      category: 'engagement',
      label: details?.label,
      value: details?.value,
    })
  }, [trackEvent])

  // Track property interactions
  const trackPropertyInteraction = useCallback((action: string, propertyId?: string, details?: PropertyDetails) => {
    trackEvent(action, {
      category: 'property',
      label: propertyId || details?.label,
      value: details?.value,
    })
  }, [trackEvent])

  // Track form submissions
  const trackFormSubmission = useCallback((formName: string, success: boolean) => {
    trackEvent(success ? 'form_submit_success' : 'form_submit_error', {
      category: 'form',
      label: formName,
      value: success ? 1 : 0,
    })
  }, [trackEvent])

  // Track search queries
  const trackSearch = useCallback((query: string, resultsCount?: number) => {
    trackEvent('search', {
      category: 'search',
      label: query,
      value: resultsCount,
    })
  }, [trackEvent])

  // Track user registration/login
  const trackUserAction = useCallback((action: 'login' | 'register' | 'logout', method?: string) => {
    trackEvent(action, {
      category: 'user',
      label: method || 'default',
    })
  }, [trackEvent])

  // Meta Pixel tracking functions
  const trackMetaPixelEvent = useCallback((eventName: string, parameters?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, parameters)
    }
  }, [])

  const trackMetaPixelPageView = useCallback(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView')
    }
  }, [])

  const trackMetaPixelCustomEvent = useCallback((eventName: string, parameters?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, parameters)
    }
  }, [])

  return {
    trackPageView,
    trackEvent,
    trackEngagement,
    trackPropertyInteraction,
    trackFormSubmission,
    trackSearch,
    trackUserAction,
    trackMetaPixelEvent,
    trackMetaPixelPageView,
    trackMetaPixelCustomEvent,
  }
}
