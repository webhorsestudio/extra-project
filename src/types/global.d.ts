// Global type declarations for analytics tracking

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
    fbq: (...args: unknown[]) => void
  }
}

export {}
