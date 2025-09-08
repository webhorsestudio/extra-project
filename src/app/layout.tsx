// Removed unused Metadata import since we removed generateMetadata from root layout
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import DeviceDetectionLoader from "@/components/DeviceDetectionLoader";
import Script from "next/script";
import { createSupabaseApiClient } from "@/lib/supabase/api";
import { TrackingScripts } from "@/components/analytics/TrackingScripts";

const inter = Inter({ subsets: ["latin"] });

// Removed generateMetadata from root layout to allow page-specific metadata
// Each page will handle its own metadata generation

// Favicon is now handled by metadata generation

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch tracking settings for server-side rendering
  let trackingSettings = { 
    google_analytics_id: '', 
    google_tag_manager_id: '', 
    meta_pixel_id: '' 
  }
  
  try {
    const supabase = await createSupabaseApiClient();
    const { data, error } = await supabase
      .from('settings')
      .select('google_analytics_id, google_tag_manager_id, meta_pixel_id')
      .single();
    
    if (error) {
      console.error('Error fetching tracking settings:', error);
    } else if (data) {
      trackingSettings = {
        google_analytics_id: data.google_analytics_id || '',
        google_tag_manager_id: data.google_tag_manager_id || '',
        meta_pixel_id: data.meta_pixel_id || ''
      }
    }
  } catch (error) {
    console.error('Error fetching tracking settings:', error);
    // Ensure trackingSettings has default values even on error
    trackingSettings = { 
      google_analytics_id: '', 
      google_tag_manager_id: '', 
      meta_pixel_id: '' 
    }
  }

  // Ensure trackingSettings is always defined with safe defaults
  const safeTrackingSettings = {
    google_analytics_id: trackingSettings?.google_analytics_id || '',
    google_tag_manager_id: trackingSettings?.google_tag_manager_id || '',
    meta_pixel_id: trackingSettings?.meta_pixel_id || ''
  }

  return (
    <html lang="en">
      <head>
        <Script src="/suppress-extension-errors.js" strategy="afterInteractive" />
        
        {/* Google Analytics - Load only if ID is provided */}
        {safeTrackingSettings.google_analytics_id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${safeTrackingSettings.google_analytics_id}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${safeTrackingSettings.google_analytics_id}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `}
            </Script>
          </>
        )}
        
        {/* Google Tag Manager - Load only if ID is provided */}
        {safeTrackingSettings.google_tag_manager_id && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${safeTrackingSettings.google_tag_manager_id}');
            `}
          </Script>
        )}
        
        {/* Meta Pixel - Handled by TrackingScripts component */}
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Comprehensive hydration warning suppression
              const originalError = console.error;
              console.error = (...args) => {
                const message = args[0];
                if (
                  typeof message === 'string' &&
                  (message.includes('Hydration failed') || 
                   message.includes('fdprocessedid') ||
                   message.includes('server rendered HTML') ||
                   message.includes('hydration') ||
                   message.includes('"undefined" is not valid JSON') ||
                   message.includes('chrome-extension') ||
                   message.includes('react-hydration-error'))
                ) {
                  // Suppress hydration warnings for known browser extensions and attributes
                  console.warn('Suppressed hydration warning:', message);
                  return;
                }
                originalError.apply(console, args);
              };
              
              // Enhanced global error handler for JSON parsing and browser extension errors
              window.addEventListener('error', (event) => {
                // Handle JSON parsing errors
                if (event.error && event.error.message && event.error.message.includes('JSON')) {
                  console.warn('JSON parsing error caught and handled:', event.error.message);
                  event.preventDefault();
                  return false;
                }
                
                // Handle browser extension errors
                if (event.filename && event.filename.includes('chrome-extension')) {
                  console.warn('Browser extension error caught and handled:', event.message);
                  event.preventDefault();
                  return false;
                }
                
                // Handle "undefined" JSON parsing errors specifically
                if (event.message && event.message.includes('"undefined" is not valid JSON')) {
                  console.warn('Undefined JSON parsing error caught and handled');
                  event.preventDefault();
                  return false;
                }
                
                // Handle specific chrome extension frame_ant errors
                if (event.filename && event.filename.includes('frame_ant')) {
                  console.warn('Frame ant extension error caught and handled');
                  event.preventDefault();
                  return false;
                }
              });
              
              // Override JSON.parse to handle undefined values
              const originalJSONParse = JSON.parse;
              JSON.parse = function(text, reviver) {
                if (text === undefined || text === null || text === 'undefined') {
                  console.warn('Attempted to parse undefined/null as JSON, returning null');
                  return null;
                }
                try {
                  return originalJSONParse.call(this, text, reviver);
                } catch (error) {
                  console.warn('JSON.parse error caught:', error.message);
                  return null;
                }
              };
              
              // Suppress specific chrome extension errors
              const originalConsoleError = console.error;
              console.error = function(...args) {
                const message = args[0];
                if (typeof message === 'string' && (
                  message.includes('"undefined" is not valid JSON') ||
                  message.includes('chrome-extension') ||
                  message.includes('frame_ant') ||
                  message.includes('fdprocessedid')
                )) {
                  console.warn('Suppressed: Browser extension error');
                  return;
                }
                originalConsoleError.apply(console, args);
              };
              
              // Remove fdprocessedid attributes from all elements to prevent hydration mismatches
              const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  if (mutation.type === 'attributes' && mutation.attributeName === 'fdprocessedid') {
                    const target = mutation.target;
                    if (target && target.removeAttribute) {
                      target.removeAttribute('fdprocessedid');
                    }
                  }
                });
              });
              
              // Start observing when DOM is ready
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                  observer.observe(document.body, {
                    attributes: true,
                    attributeFilter: ['fdprocessedid'],
                    subtree: true
                  });
                });
              } else {
                observer.observe(document.body, {
                  attributes: true,
                  attributeFilter: ['fdprocessedid'],
                  subtree: true
                });
              }
            `,
          }}
        />
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link rel="icon" href="/favicon" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        {/* Google Tag Manager NoScript fallback */}
        {safeTrackingSettings.google_tag_manager_id && (
          <noscript>
            <iframe 
              src={`https://www.googletagmanager.com/ns.html?id=${safeTrackingSettings.google_tag_manager_id}`}
              height="0" 
              width="0" 
              style={{display:'none',visibility:'hidden'}}
            />
          </noscript>
        )}
        
        {/* Meta Pixel NoScript fallback */}
        {safeTrackingSettings.meta_pixel_id && (
          <noscript>
            <img 
              height="1" 
              width="1" 
              style={{display:'none'}}
              src={`https://www.facebook.com/tr?id=${safeTrackingSettings.meta_pixel_id}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
        
        <DeviceDetectionLoader>
        {children}
        </DeviceDetectionLoader>
        
        {/* Client-side tracking scripts for dynamic updates */}
        <TrackingScripts 
          googleAnalyticsId={safeTrackingSettings.google_analytics_id}
          googleTagManagerId={safeTrackingSettings.google_tag_manager_id}
          metaPixelId={safeTrackingSettings.meta_pixel_id}
        />
        
        <Toaster />
      </body>
    </html>
  );
} 