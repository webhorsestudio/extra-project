/**
 * Unified Device Detection Utility
 * Single source of truth for all device detection logic
 */

export interface DeviceDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  userAgent: string;
  screenWidth?: number;
}

/**
 * Server-side device detection using User-Agent
 */
export function detectDeviceFromUserAgent(userAgent: string): DeviceDetectionResult {
  const ua = userAgent.toLowerCase();
  
  // Mobile devices (phones)
  const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini|mobile|mobile safari|mobile chrome/i.test(ua);
  
  // Tablets
  const isTabletUA = /ipad|tablet|kindle|silk|playbook|bb10/i.test(ua);
  
  // Desktop
  const isDesktopUA = !isMobileUA && !isTabletUA;
  
  let deviceType: 'mobile' | 'tablet' | 'desktop';
  if (isMobileUA) {
    deviceType = 'mobile';
  } else if (isTabletUA) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }
  
  return {
    isMobile: isMobileUA || isTabletUA, // Include tablets in mobile layout
    isTablet: isTabletUA,
    isDesktop: isDesktopUA,
    deviceType,
    userAgent: userAgent
  };
}

/**
 * Client-side device detection using screen width and User-Agent
 */
export function detectDeviceFromScreen(userAgent: string, screenWidth: number): DeviceDetectionResult {
  const uaResult = detectDeviceFromUserAgent(userAgent);
  
  // Override with screen-based detection for dev tools
  const isMobileScreen = screenWidth <= 768;
  const isDesktopScreen = screenWidth > 1024;
  
  // If screen suggests mobile but UA suggests desktop (dev tools), use screen
  if (isMobileScreen && uaResult.isDesktop) {
    return {
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      deviceType: 'mobile',
      userAgent: userAgent,
      screenWidth: screenWidth
    };
  }
  
  // If screen suggests desktop but UA suggests mobile, use screen
  if (isDesktopScreen && uaResult.isMobile) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      deviceType: 'desktop',
      userAgent: userAgent,
      screenWidth: screenWidth
    };
  }
  
  // Default to UA-based detection
  return {
    ...uaResult,
    screenWidth: screenWidth
  };
}

/**
 * Check if device should use mobile layout
 */
export function shouldUseMobileLayout(userAgent: string, screenWidth?: number): boolean {
  if (screenWidth !== undefined) {
    return detectDeviceFromScreen(userAgent, screenWidth).isMobile;
  }
  return detectDeviceFromUserAgent(userAgent).isMobile;
}

/**
 * Get canonical URL for a property (always web version)
 */
export function getCanonicalPropertyUrl(slug: string, baseUrl: string): string {
  return `${baseUrl}/properties/${slug}`;
}

/**
 * Get mobile URL for a property
 */
export function getMobilePropertyUrl(slug: string, baseUrl: string): string {
  return `${baseUrl}/m/properties/${slug}`;
}

/**
 * Extract slug from property URL
 */
export function extractSlugFromPropertyUrl(pathname: string): string | null {
  // Handle both /properties/slug and /m/properties/slug
  const match = pathname.match(/^\/(?:m\/)?properties\/([^\/]+)$/);
  return match ? match[1] : null;
}
