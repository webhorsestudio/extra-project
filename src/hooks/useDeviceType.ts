import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const width = window.innerWidth

      // Check for mobile devices
      if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent) || width <= 768) {
        setDeviceType('mobile')
      }
      // Check for tablets
      else if (/ipad|tablet/.test(userAgent) || (width > 768 && width <= 1024)) {
        setDeviceType('tablet')
      }
      // Default to desktop
      else {
        setDeviceType('desktop')
      }
    }

    // Detect on mount
    detectDevice()

    // Listen for resize events
    const handleResize = () => {
      detectDevice()
    }

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return deviceType
}
