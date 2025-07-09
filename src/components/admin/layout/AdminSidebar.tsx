'use client'

import AdminLogo from '@/components/admin/AdminLogo'
import { AdminNavigation } from '../navigation/AdminNavigation'
import type { NavigationItem } from '../navigation/navigationConfig'

interface LogoData {
  logoUrl: string | null
  logoAltText: string | null
}

interface AdminSidebarProps {
  expandedItems: string[]
  onToggleExpanded: (itemName: string) => void
  logoData?: LogoData
  logoLoading?: boolean
  navigationItems: NavigationItem[]
  version?: string
}

export function AdminSidebar({ 
  expandedItems, 
  onToggleExpanded, 
  logoData,
  logoLoading = false,
  navigationItems,
  version = '1.0.0'
}: AdminSidebarProps) {
  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-card border-r pt-5 pb-4 overflow-y-auto">
        {/* Logo Section */}
        <div className="flex flex-col items-center flex-shrink-0 px-4 pb-3 border-b border-gray-200">
          <AdminLogo 
            className="h-8 w-32" 
            width={128} 
            height={32} 
            alt="Admin Logo" 
            priority 
            logoUrl={logoData?.logoUrl}
            logoAltText={logoData?.logoAltText}
            loading={logoLoading}
          />
        </div>
        {/* Version Section */}
        <div className="flex flex-col items-center py-2 border-b border-gray-100">
          <span className="text-xs italic text-gray-500">Version: {version}</span>
        </div>
        {/* Navigation Section */}
        <div className="mt-2">
          <AdminNavigation 
            expandedItems={expandedItems}
            onToggleExpanded={onToggleExpanded}
            navigationItems={navigationItems}
          />
        </div>
      </div>
    </div>
  )
} 