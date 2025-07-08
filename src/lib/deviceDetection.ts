import { headers } from 'next/headers'

export async function isMobileDevice(pathname?: string): Promise<boolean> {
  // If pathname is provided and it's an admin route, return false (desktop)
  if (pathname && pathname.startsWith('/admin')) {
    return false;
  }
  
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  // Include both mobile phones and tablets in mobile layout
  return /iPhone|iPad|Android|Mobile|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
}

export async function isTabletDevice(pathname?: string): Promise<boolean> {
  // If pathname is provided and it's an admin route, return false (desktop)
  if (pathname && pathname.startsWith('/admin')) {
    return false;
  }
  
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  return /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent)
}

export async function isDesktopDevice(pathname?: string): Promise<boolean> {
  // If pathname is provided and it's an admin route, return true (desktop)
  if (pathname && pathname.startsWith('/admin')) {
    return true;
  }
  
  const mobile = await isMobileDevice(pathname)
  const tablet = await isTabletDevice(pathname)
  return !mobile && !tablet
}

export async function getDeviceType(pathname?: string): Promise<'mobile' | 'tablet' | 'desktop'> {
  if (await isMobileDevice(pathname)) return 'mobile'
  if (await isTabletDevice(pathname)) return 'tablet'
  return 'desktop'
}

// New function to check if device should use mobile layout (includes tablets)
export async function shouldUseMobileLayout(pathname?: string): Promise<boolean> {
  // If pathname is provided and it's an admin route, return false (desktop)
  if (pathname && pathname.startsWith('/admin')) {
    return false;
  }
  
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  // Include both mobile phones and tablets in mobile layout
  return /iPhone|iPad|Android|Mobile|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
} 