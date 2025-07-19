import { getFooterData } from '@/lib/footer-data'
import { getBrandingData } from '@/lib/branding-server'
import { getLocationsData } from '@/lib/locations-data-server'
import { getConfigurationData } from '@/lib/configuration-data-server'
import { getBudgetData } from '@/lib/budget-data-server'
import { getCategoriesData } from '@/lib/categories-data-server'
import { createSupabaseServerClientSafe } from '@/lib/supabase/server-fallback'
import ClientLayout from './ClientLayout'

// Proper TypeScript interfaces
interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

interface UserProfile {
  id: string
  full_name: string
  avatar_data?: string | null
  role: string
  created_at: string
  updated_at: string
}

interface UserData {
  user: User | null
  userProfile: UserProfile | null
}

interface ServerLayoutProps {
  children: React.ReactNode
  showCategoryBar?: boolean
}

export default async function ServerLayout({ children, showCategoryBar = false }: ServerLayoutProps) {
  console.log('ServerLayout: Starting data fetch for showCategoryBar:', showCategoryBar)
  
  // Fetch all data in parallel with error handling
  const [footerDataResult, brandingDataResult, locationsDataResult, configurationDataResult, budgetDataResult, categoriesDataResult, userResult] = await Promise.allSettled([
    getFooterData(),
    getBrandingData(),
    getLocationsData(),
    getConfigurationData(),
    getBudgetData(),
    getCategoriesData(),
    (async (): Promise<UserData> => {
      const supabase = await createSupabaseServerClientSafe()
      const { data: { user } } = await supabase.auth.getUser()
      
      let userProfile: UserProfile | null = null
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        userProfile = profile
      }
      
      return { user, userProfile }
    })()
  ])

  // Extract data with fallbacks and logging
  const footerData = footerDataResult.status === 'fulfilled' ? footerDataResult.value : undefined
  const brandingData = brandingDataResult.status === 'fulfilled' ? brandingDataResult.value : undefined
  const locationsData = locationsDataResult.status === 'fulfilled' ? locationsDataResult.value : []
  const configurationData = configurationDataResult.status === 'fulfilled' ? configurationDataResult.value : undefined
  const budgetData = budgetDataResult.status === 'fulfilled' ? budgetDataResult.value : undefined
  const categoriesData = categoriesDataResult.status === 'fulfilled' ? categoriesDataResult.value : []

  // Log data fetch results
  console.log('ServerLayout: Data fetch results:', {
    footerData: footerDataResult.status,
    brandingData: brandingDataResult.status,
    locationsData: locationsDataResult.status,
    configurationData: configurationDataResult.status,
    budgetData: budgetDataResult.status,
    categoriesData: categoriesDataResult.status,
    userData: userResult.status,
    categoriesCount: categoriesData.length
  })

  // Handle user data with proper typing
  let userObj: {
    name?: string
    avatar?: string | null
    role?: string
    email?: string
  } | null = null
  
  if (userResult.status === 'fulfilled' && userResult.value.user && userResult.value.userProfile) {
    const { user, userProfile } = userResult.value
    userObj = {
      name: userProfile.full_name || user.user_metadata?.full_name || user.email || 'Unknown User',
      avatar: userProfile.avatar_data || null,
      role: userProfile.role,
      email: user.email || '',
    }
  }

  return (
    <ClientLayout
      showCategoryBar={showCategoryBar}
      initialFooterData={footerData}
      initialBrandingData={brandingData}
      initialLocationsData={locationsData}
      initialConfigurationData={configurationData}
      initialBudgetData={budgetData}
      initialCategoriesData={categoriesData}
      initialUser={userObj}
    >
      {children}
    </ClientLayout>
  )
} 