'use client'

import { useEffect } from 'react'

interface TrackingScriptsProps {
  googleAnalyticsId?: string
  googleTagManagerId?: string
  metaPixelId?: string
}

export function TrackingScripts({ googleAnalyticsId, googleTagManagerId, metaPixelId }: TrackingScriptsProps) {
  useEffect(() => {
    // Initialize Google Analytics if ID is provided
    if (googleAnalyticsId && typeof window !== 'undefined') {
      // Check if gtag is already loaded
      if (typeof window.gtag === 'undefined') {
        // Load Google Analytics script dynamically
        const script = document.createElement('script')
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`
        document.head.appendChild(script)

        script.onload = () => {
          // Initialize gtag after script loads
          window.dataLayer = window.dataLayer || []
          function gtag(...args: unknown[]) {
            window.dataLayer.push(args)
          }
          window.gtag = gtag
          
          gtag('js', new Date())
          gtag('config', googleAnalyticsId, {
            page_title: document.title,
            page_location: window.location.href,
          })
        }
      } else {
        // gtag already exists, just configure it
        window.gtag('config', googleAnalyticsId, {
          page_title: document.title,
          page_location: window.location.href,
        })
      }
    }

    // Initialize Google Tag Manager if ID is provided
    if (googleTagManagerId && typeof window !== 'undefined') {
      // Check if GTM is already loaded
      if (typeof window.dataLayer === 'undefined') {
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
      }
    }

    // Initialize Meta Pixel if ID is provided
    if (metaPixelId && typeof window !== 'undefined') {
      // Check if fbq is already loaded
      if (typeof window.fbq === 'undefined') {
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
          fbq('init', '${metaPixelId}');
          fbq('track', 'PageView');
        `
        document.head.appendChild(script)
      } else {
        // fbq already exists, just track page view
        window.fbq('track', 'PageView')
      }
    }
  }, [googleAnalyticsId, googleTagManagerId, metaPixelId])

  // Track page views when route changes
  useEffect(() => {
    if (googleAnalyticsId && typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', googleAnalyticsId, {
        page_title: document.title,
        page_location: window.location.href,
      })
    }
  }, [googleAnalyticsId])

  return null
}
