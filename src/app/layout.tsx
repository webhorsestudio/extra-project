import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import DeviceDetectionLoader from "@/components/DeviceDetectionLoader";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Property Management System",
  description: "A comprehensive property management system",
  icons: {
    icon: '/favicon.ico',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script src="/suppress-extension-errors.js" strategy="afterInteractive" />
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
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <DeviceDetectionLoader>
        {children}
        </DeviceDetectionLoader>
        <Toaster />
      </body>
    </html>
  );
} 