"use client"

import React from 'react'
import { useEffect, useState } from 'react'
import { getFooterDataClient } from '@/lib/footer-data-client'
import { FooterData } from '@/lib/footer-data'
import { BrandingData } from '@/lib/branding'
import { LocationData } from '@/lib/locations-data-client'
import { ConfigurationData } from '@/lib/configuration-data-client'
import { BudgetData } from '@/lib/budget-data'
import { CategoryData } from '@/lib/categories-data-server'
import Navbar from "@/components/web/Navbar"
import Footer from "@/components/web/Footer"
import { PropertyCategoryBar } from "@/components/web/PropertyCategoryBar"
import { useCategories } from "@/hooks/useCategories"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import CategoryBarErrorFallback from './CategoryBarErrorFallback'
import { Location } from '@/hooks/useLocations'
import PopupAdsManager from './PopupAdsManager'

// Proper TypeScript interfaces
interface User {
  name?: string
  avatar?: string | null
  role?: string
  email?: string
}

interface ClientLayoutProps {
  children: React.ReactNode
  showCategoryBar?: boolean
  initialFooterData?: FooterData
  initialBrandingData?: BrandingData
  initialLocationsData?: LocationData[]
  initialConfigurationData?: ConfigurationData
  initialBudgetData?: BudgetData
  initialCategoriesData?: CategoryData[]
  initialUser?: User | null
}

// Transform LocationData to Location type
function transformLocationData(locationData: LocationData[]): Location[] {
  return locationData.map(loc => ({
    ...loc,
    is_active: true, // Default to active since we don't have this info
    description: loc.description || null,
    image_url: loc.image_url || null,
    image_storage_path: loc.image_storage_path || null,
    property_count: 0 // Default value
  }))
}

export default function ClientLayout({ 
  children, 
  showCategoryBar = false, 
  initialFooterData, 
  initialBrandingData,
  initialLocationsData,
  initialConfigurationData,
  initialBudgetData,
  initialCategoriesData,
  initialUser = null
}: ClientLayoutProps) {
  const [footerData, setFooterData] = useState<FooterData | null>(initialFooterData || null)
  const [loading, setLoading] = useState(!initialFooterData)
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories({ initialData: initialCategoriesData })

  // Transform locations data
  const transformedLocations = transformLocationData(initialLocationsData || [])

  useEffect(() => {
    // If we have initial data from SSR, don't fetch again
    if (initialFooterData) {
      return
    }

    async function fetchFooterData() {
      try {
        const data = await getFooterDataClient()
        setFooterData(data)
      } catch (error) {
        console.error('Error fetching footer data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFooterData()
  }, [initialFooterData])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar 
          logoUrl={initialBrandingData?.logo_url || null}
          logoAlt={initialBrandingData?.logo_alt || 'Company Logo'}
          hasLogo={!!initialBrandingData?.logo_url}
          siteTitle={initialBrandingData?.company_name || 'Property'}
          locations={transformedLocations}
          configurationData={initialConfigurationData}
          budgetData={initialBudgetData}
          initialUser={initialUser}
        />
        <main className="flex-grow">
          {children}
        </main>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        logoUrl={initialBrandingData?.logo_url || null}
        logoAlt={initialBrandingData?.logo_alt || 'Company Logo'}
        hasLogo={!!initialBrandingData?.logo_url}
        siteTitle={initialBrandingData?.company_name || 'Property'}
        locations={transformedLocations}
        configurationData={initialConfigurationData}
        budgetData={initialBudgetData}
        initialUser={initialUser}
      />
      {showCategoryBar && (
        <ErrorBoundary fallback={CategoryBarErrorFallback}>
          {!categoriesLoading && categories.length > 0 && !categoriesError && (
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="container mx-auto px-6 lg:px-8">
                <PropertyCategoryBar categories={categories} />
              </div>
            </div>
          )}
          {categoriesError && (
            <div className="bg-gray-50 border-b border-gray-200 py-4">
              <div className="container mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <span>Unable to load categories: {categoriesError}</span>
                </div>
              </div>
            </div>
          )}
        </ErrorBoundary>
      )}
      <main className={`flex-grow ${footerData?.layout?.show_cta ? 'pb-20' : ''}`}>
        {children}
      </main>
      {footerData && <Footer footerData={footerData} />}
      
      {/* Popup Ads Manager */}
      <PopupAdsManager />
    </div>
  )
} 