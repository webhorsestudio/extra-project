import { useState, useEffect } from 'react'
import { detectDeviceFromScreen } from '@/lib/device-detection'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')

  useEffect(() => {
    const detectDevice = () => {
      const deviceInfo = detectDeviceFromScreen(navigator.userAgent, window.innerWidth)
      setDeviceType(deviceInfo.deviceType)
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
