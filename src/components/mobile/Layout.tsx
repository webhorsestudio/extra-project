import MobileLayoutClient from './MobileLayoutClient'
import { getFooterData } from '@/lib/footer-data'

interface MobileLayoutProps {
  children: React.ReactNode
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
    <MobileLayoutClient footerData={footerData}>
      {children}
    </MobileLayoutClient>
  )
} 