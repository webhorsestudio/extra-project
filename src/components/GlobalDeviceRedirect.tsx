'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { detectDeviceFromScreen } from '@/lib/device-detection';

export default function GlobalDeviceRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRedirectedThisSession = useRef(false);

  useEffect(() => {
    setMounted(true);
    console.log('🌍 GlobalDeviceRedirect mounted');
  }, []);

  useEffect(() => {
    if (!mounted) return;

    console.log('🌍 GlobalDeviceRedirect useEffect running, pathname:', pathname);

    const checkAndRedirect = () => {
      // Prevent multiple redirects within a short period
      if (hasRedirectedThisSession.current) {
        console.log('🌍 GlobalDeviceRedirect: Already redirected this session, skipping.');
        return;
      }

      // Skip device detection for admin, API, and auth routes (matching middleware logic)
      const isAdminRoute = pathname.startsWith('/admin');
      const isApiRoute = pathname.startsWith('/api');
      const isAuthRoute = pathname.startsWith('/users/') ||
                         pathname.startsWith('/login') ||
                         pathname.startsWith('/register') ||
                         pathname.startsWith('/signup');

      if (isAdminRoute || isApiRoute || isAuthRoute) {
        console.log('🌍 GlobalDeviceRedirect: Skipping device detection for route:', pathname);
        return;
      }

      const userAgent = navigator.userAgent;
      const screenWidth = window.innerWidth;
      const deviceInfo = detectDeviceFromScreen(userAgent, screenWidth);

      console.log('🔍 GlobalDeviceRedirect Debug:', {
        pathname,
        screenWidth,
        deviceInfo,
        isMobileScreen: deviceInfo.isMobile,
        hasRedirectedThisSession: hasRedirectedThisSession.current
      });

      let targetUrl: string | null = null;
      const isMobileRoute = pathname.startsWith('/m/') || pathname === '/m';
      const isWebRoute = !isMobileRoute;

      // Define a "tablet" range where we don't force a redirect to avoid flickering
      const isTabletRange = screenWidth > 768 && screenWidth <= 1024;

      // Handle redirection logic for all pages
      if (deviceInfo.isMobile && isWebRoute && !isTabletRange) {
        // Web route on mobile screen -> redirect to mobile version
        if (pathname === '/') {
          targetUrl = '/m';
        } else if (pathname.startsWith('/properties/')) {
          const slug = pathname.split('/properties/')[1];
          targetUrl = `/m/properties/${slug}`;
        } else {
          targetUrl = `/m${pathname}`;
        }
      } else if (!deviceInfo.isMobile && isMobileRoute && !isTabletRange) {
        // Mobile route on desktop screen -> redirect to web version
        if (pathname === '/m') {
          targetUrl = '/';
        } else if (pathname.startsWith('/m/properties/')) {
          const slug = pathname.split('/m/properties/')[1];
          targetUrl = `/properties/${slug}`;
        } else {
          targetUrl = pathname.substring(2); // Remove '/m' prefix
        }
      }

      if (targetUrl && targetUrl !== pathname) {
        console.log(`🚀 GlobalDeviceRedirect: Redirecting from ${pathname} to ${targetUrl}`);
        hasRedirectedThisSession.current = true;
        // Add client=true parameter to indicate this is a client-side redirect
        const urlWithClientParam = `${targetUrl}?client=true`;
        router.replace(urlWithClientParam);
      }
    };

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        hasRedirectedThisSession.current = false; // Allow new redirect on resize
        checkAndRedirect();
      }, 300); // Debounce resize events
    };

    // Initial check with a small delay to ensure hydration
    const initialTimeoutId = setTimeout(checkAndRedirect, 100);

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(initialTimeoutId);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [mounted, pathname, router]);

  if (!mounted) return null;

  return null;
}
