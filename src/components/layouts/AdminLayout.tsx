'use client'

import { useState, useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { AdminLayoutSkeleton } from '@/components/admin/layout/AdminLayoutSkeleton'

interface AdminLayoutProps {
  children: React.ReactNode;
  user: any;
  profile: any;
  loading: boolean;
  logoData: { logoUrl: string | null; logoAltText: string | null };
  logoLoading: boolean;
  navigationItems: any[];
}

export function AdminLayout({ children, user, profile, loading, logoData, logoLoading, navigationItems }: AdminLayoutProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['Dashboard'])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    )
  }

  const handleSignOut = async () => { /* TODO: implement sign out SSR if needed */ }

  if (!isMounted) {
    return <AdminLayoutSkeleton />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
          expandedItems={expandedItems}
          onToggleExpanded={toggleExpanded}
          logoData={logoData}
          logoLoading={logoLoading}
          navigationItems={navigationItems}
          version={version}
        />

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Header */}
          <AdminHeader
            user={user}
            profile={profile}
            loading={loading}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpanded}
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuOpenChange={setIsMobileMenuOpen}
            onSignOut={handleSignOut}
          />

          {/* Page content */}
          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
} 