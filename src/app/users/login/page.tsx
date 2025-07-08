import { getBrandingData } from '@/lib/branding-server'
import { LoginPage } from './LoginPageClient'

export default async function Page() {
  const branding = await getBrandingData()
  return <LoginPage branding={branding} />
} 