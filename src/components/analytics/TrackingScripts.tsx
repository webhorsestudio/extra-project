'use client'

import { useEffect } from 'react'

interface TrackingScriptsProps {
  googleAnalyticsId?: string
  googleTagManagerId?: string
  metaPixelId?: string
}

export function TrackingScripts({ googleAnalyticsId, googleTagManagerId, metaPixelId }: TrackingScriptsProps) {
  useEffect(() => {
    // Ensure we're in a browser environment with DOM access
    if (typeof window === 'undefined' || typeof document === 'undefined' || !document.head) {
      console.warn('TrackingScripts: Not in browser environment, skipping initialization');
      return;
    }

    // Initialize Google Analytics if ID is provided
    if (googleAnalyticsId) {
      // Check if gtag is already loaded
      if (typeof window.gtag === 'undefined') {
        try {
          // Load Google Analytics script dynamically
          const script = document.createElement('script')
          script.async = true
          script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`
          document.head.appendChild(script)

          script.onload = () => {
            // Initialize gtag after script loads
            try {
              window.dataLayer = window.dataLayer || []
              function gtag(...args: unknown[]) {
                if (window.dataLayer && Array.isArray(window.dataLayer)) {
                  window.dataLayer.push(args)
                }
              }
              window.gtag = gtag
              
              gtag('js', new Date())
              gtag('config', googleAnalyticsId, {
                page_title: document.title,
                page_location: window.location.href,
              })
            } catch (error) {
              console.warn('Google Analytics initialization error:', error)
            }
          }
        } catch (error) {
          console.warn('Google Analytics script loading error:', error)
        }
      } else {
        // gtag already exists, just configure it
        try {
          if (typeof window.gtag === 'function') {
            window.gtag('config', googleAnalyticsId, {
              page_title: document.title,
              page_location: window.location.href,
            })
          }
        } catch (error) {
          console.warn('Google Analytics configuration error:', error)
        }
      }
    }

    // Initialize Google Tag Manager if ID is provided
    if (googleTagManagerId) {
      // Check if GTM is already loaded
      if (typeof window.dataLayer === 'undefined') {
        try {
          window.dataLayer = window.dataLayer || []
          
          // Load GTM script dynamically
          const script = document.createElement('script')
          script.innerHTML = `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${googleTagManagerId}');
          `
          document.head.appendChild(script)
        } catch (error) {
          console.warn('Google Tag Manager initialization error:', error)
        }
      }
    }

    // Initialize Meta Pixel if ID is provided
    if (metaPixelId) {
      // Check if fbq is already loaded
      if (typeof window.fbq === 'undefined') {
        try {
          // Load Meta Pixel script dynamically
          const script = document.createElement('script')
          script.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version='2.0';
            t=b.createElement(e);t.async=true;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
          `
          document.head.appendChild(script)
          
          // Wait for script to load and then initialize
          script.onload = () => {
            // Wait a bit more to ensure fbq is fully initialized
            setTimeout(() => {
              try {
                if (typeof window.fbq === 'function') {
                  window.fbq('init', metaPixelId);
                  window.fbq('track', 'PageView');
                }
              } catch (error) {
                console.warn('Meta Pixel initialization error:', error)
              }
            }, 100);
          }
          
          // Fallback initialization if onload doesn't fire
          setTimeout(() => {
            try {
              if (typeof window.fbq === 'function') {
                window.fbq('init', metaPixelId);
                window.fbq('track', 'PageView');
              }
            } catch (error) {
              console.warn('Meta Pixel fallback initialization error:', error)
            }
          }, 500);
        } catch (error) {
          console.warn('Meta Pixel script loading error:', error)
        }
      } else {
        // fbq already exists, just track page view with error handling
        try {
          if (typeof window.fbq === 'function') {
            window.fbq('track', 'PageView')
          }
        } catch (error) {
          console.warn('Meta Pixel page view tracking error:', error)
        }
      }
    }
  }, [googleAnalyticsId, googleTagManagerId, metaPixelId])

  // Track page views when route changes
  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    if (googleAnalyticsId && window.gtag) {
      try {
        if (typeof window.gtag === 'function') {
          window.gtag('config', googleAnalyticsId, {
            page_title: document.title,
            page_location: window.location.href,
          })
        }
      } catch (error) {
        console.warn('Google Analytics page view tracking error:', error)
      }
    }
  }, [googleAnalyticsId])

  return null
}
