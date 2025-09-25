import { Suspense } from 'react'
import MobileLayoutClient from './MobileLayoutClient'
import MobileViewModeDetector from './MobileViewModeDetector'
import { getFooterData } from '@/lib/footer-data'

interface MobileLayoutProps {
  children: React.ReactNode
}

// Loading component for Suspense fallback
function MobileLayoutLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  )
}

export default async function MobileLayout({ children }: MobileLayoutProps) {
  // Fetch footer data on server side
  let footerData = null
  try {
    footerData = await getFooterData()
  } catch (error) {
    // Log error but don't break the layout
    console.error('Error fetching footer data in mobile layout:', error)
  }

  return (
    <Suspense fallback={<MobileLayoutLoading />}>
      <MobileViewModeDetector>
        <MobileLayoutClient footerData={footerData}>
          {children}
        </MobileLayoutClient>
      </MobileViewModeDetector>
    </Suspense>
  )
} 