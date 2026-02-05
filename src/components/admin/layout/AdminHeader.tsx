'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { AdminNavigation } from '../navigation/AdminNavigation'
import { AdminUserProfile } from '../user/AdminUserProfile'
import { navigationItems } from '../navigation/navigationConfig'

interface UserProfile {
  id: string
  full_name: string
  role: string
  avatar_url?: string
  avatar_data?: string
  created_at: string
  updated_at: string
}

interface AdminHeaderProps {
  user: {
    id: string
    email: string
    created_at?: string
    updated_at?: string
  } | null
  profile: UserProfile | null
  loading: boolean
  expandedItems: string[]
  onToggleExpanded: (itemName: string) => void
  isMobileMenuOpen: boolean
  onMobileMenuOpenChange: (open: boolean) => void

}

export function AdminHeader({
  user,
  profile,
  loading,
  expandedItems,
  onToggleExpanded,
  isMobileMenuOpen,
  onMobileMenuOpenChange
}: AdminHeaderProps) {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="mr-2"
      >
        <Button variant="outline" size="sm" className="font-medium px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
          Visit Website
        </Button>
      </a>
      <Sheet open={isMobileMenuOpen} onOpenChange={onMobileMenuOpenChange}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetTitle className="mb-4">Admin Panel</SheetTitle>
          <AdminNavigation 
            expandedItems={expandedItems}
            onToggleExpanded={onToggleExpanded}
            isMobile={true}
            onMobileItemClick={() => onMobileMenuOpenChange(false)}
            navigationItems={navigationItems}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <AdminUserProfile 
            user={user || { id: '', email: '' }}
            profile={profile}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
} 