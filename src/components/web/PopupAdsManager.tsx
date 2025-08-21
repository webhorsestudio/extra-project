'use client'

import { useEffect, useState } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeviceType } from '@/hooks/useDeviceType'
import { useCurrentPath } from '@/hooks/useCurrentPath'

interface PopupAd {
  id: string
  title: string
  type: 'modal' | 'banner' | 'toast' | 'slide_in' | 'fullscreen'
  position: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center' | 'top_center' | 'bottom_center'
  content: {
    title: string
    description: string
    button_text: string
  }
  image_url?: string
  link_url?: string
  link_text?: string
  display_delay: number
  display_duration: number
  max_display_count: number
}

export default function PopupAdsManager() {
  const deviceType = useDeviceType()
  const currentPath = useCurrentPath()
  const [popupAds, setPopupAds] = useState<PopupAd[]>([])
  const [visibleAds, setVisibleAds] = useState<Set<string>>(new Set())
  const [displayedCounts, setDisplayedCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchPopupAds()
  }, [deviceType, currentPath])

  const fetchPopupAds = async () => {
    try {
      const params = new URLSearchParams({
        device: deviceType,
        path: currentPath
      })
      
      const response = await fetch(`/api/popup-ads?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPopupAds(data.popupAds || [])
      } else {
        console.error('PopupAdsManager: Failed to fetch popup ads:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('PopupAdsManager: Error fetching popup ads:', error)
    }
  }

  const shouldShowAd = (ad: PopupAd): boolean => {
    // Check if ad has been displayed too many times
    const displayCount = displayedCounts[ad.id] || 0
    if (ad.max_display_count > 0 && displayCount >= ad.max_display_count) {
      return false
    }

    // Check if ad is already visible
    if (visibleAds.has(ad.id)) {
      return false
    }

    return true
  }

  const showAd = (ad: PopupAd) => {
    if (!shouldShowAd(ad)) return

    setVisibleAds(prev => new Set(prev).add(ad.id))
    setDisplayedCounts(prev => ({
      ...prev,
      [ad.id]: (prev[ad.id] || 0) + 1
    }))

    // Auto-hide after duration if specified
    if (ad.display_duration > 0) {
      setTimeout(() => {
        hideAd(ad.id)
      }, ad.display_duration * 1000)
    }
  }

  const hideAd = (adId: string) => {
    setVisibleAds(prev => {
      const newSet = new Set(prev)
      newSet.delete(adId)
      return newSet
    })
  }

  const handleAdClick = (ad: PopupAd) => {
    if (ad.link_url) {
      window.open(ad.link_url, '_blank', 'noopener,noreferrer')
    }
    hideAd(ad.id)
  }

  useEffect(() => {
    popupAds.forEach(ad => {
      if (shouldShowAd(ad)) {
        const timer = setTimeout(() => {
          showAd(ad)
        }, ad.display_delay * 1000)

        return () => clearTimeout(timer)
      }
    })
  }, [popupAds, visibleAds, displayedCounts])

  const getPositionClasses = (position: string): string => {
    switch (position) {
      case 'top_left':
        return 'top-4 left-4'
      case 'top_right':
        return 'top-4 right-4'
      case 'bottom_left':
        return 'bottom-4 left-4'
      case 'bottom_right':
        return 'bottom-4 right-4'
      case 'top_center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'bottom_center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      default:
        return 'top-4 right-4'
    }
  }

  const renderAd = (ad: PopupAd) => {
    if (!visibleAds.has(ad.id)) return null

    const positionClasses = getPositionClasses(ad.position)
    const isCenter = ad.position === 'center'

    if (ad.type === 'modal') {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden ${isCenter ? 'animate-in fade-in zoom-in-95 duration-300' : ''}`}>
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => hideAd(ad.id)}
              className="absolute top-2 right-2 z-10 h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Image */}
            {ad.image_url && (
              <div className="w-full h-48 bg-gray-100 overflow-hidden">
                <img
                  src={ad.image_url}
                  alt={ad.content.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {ad.content.title}
              </h3>
              {ad.content.description && (
                <p className="text-gray-600 mb-4">
                  {ad.content.description}
                </p>
              )}
              
              <div className="flex gap-3">
                {ad.content.button_text && (
                  <Button
                    onClick={() => handleAdClick(ad)}
                    className="flex-1"
                  >
                    {ad.content.button_text}
                  </Button>
                )}
                {ad.link_url && (
                  <Button
                    variant="outline"
                    onClick={() => handleAdClick(ad)}
                    className="flex items-center gap-2"
                  >
                    {ad.link_text || 'Learn More'}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (ad.type === 'banner') {
      return (
        <div className={`fixed z-40 ${positionClasses} max-w-sm w-full mx-4 ${isCenter ? 'animate-in fade-in slide-in-from-bottom-4 duration-300' : ''}`}>
          <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => hideAd(ad.id)}
              className="absolute top-2 right-2 z-10 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                {ad.image_url && (
                  <img
                    src={ad.image_url}
                    alt={ad.content.title}
                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {ad.content.title}
                  </h4>
                  {ad.content.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {ad.content.description}
                    </p>
                  )}
                  {ad.content.button_text && (
                    <Button
                      size="sm"
                      onClick={() => handleAdClick(ad)}
                      className="text-xs"
                    >
                      {ad.content.button_text}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (ad.type === 'toast') {
      return (
        <div className={`fixed z-40 ${positionClasses} max-w-xs w-full mx-4 ${isCenter ? 'animate-in fade-in slide-in-from-bottom-4 duration-300' : ''}`}>
          <div className="bg-white rounded-lg shadow-lg border p-3">
            <div className="flex items-start gap-3">
              {ad.image_url && (
                <img
                  src={ad.image_url}
                  alt={ad.content.title}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm mb-1">
                  {ad.content.title}
                </h4>
                {ad.content.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {ad.content.description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => hideAd(ad.id)}
                className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <>
      {popupAds.map(ad => (
        <div key={ad.id}>
          {renderAd(ad)}
        </div>
      ))}
    </>
  )
}
