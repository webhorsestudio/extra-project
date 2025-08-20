'use client'


import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { NavigationItem } from './navigationConfig'
import {
  Home,
  Building2,
  Users,
  MessageSquare,
  Settings,
  FileText,
  BookOpen,
  Tag,
  Globe,
  Palette,
  Paintbrush,
  Phone,
  Search,
  Key,
  Plus,
  MapPin,
  Dumbbell,
  Bell,
  HelpCircle,
  Layout,
  FileCheck,
  Building,
  Calendar,
  HomeIcon,
  Clock,
  Mail,
  Megaphone
} from 'lucide-react'

interface AdminNavigationProps {
  expandedItems: string[]
  onToggleExpanded: (itemName: string) => void
  isMobile?: boolean
  onMobileItemClick?: () => void
  navigationItems: NavigationItem[]
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Building2,
  Users,
  MessageSquare,
  Settings,
  FileText,
  BookOpen,
  Tag,
  Globe,
  Palette,
  Paintbrush,
  Phone,
  Search,
  Key,
  Plus,
  MapPin,
  Dumbbell,
  Bell,
  HelpCircle,
  Layout,
  FileCheck,
  Building,
  Calendar,
  HomeIcon,
  Clock,
  Mail,
  Megaphone
};

export function AdminNavigation({ 
  expandedItems, 
  onToggleExpanded, 
  isMobile = false,
  onMobileItemClick,
  navigationItems
}: AdminNavigationProps) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href
  
  const isSubItemActive = (item: NavigationItem) => {
    return item.subItems?.some(subItem => isActive(subItem.href)) || false
  }

  const renderNavItem = (item: NavigationItem) => {
    const isExpanded = expandedItems.includes(item.name)
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isItemActive = isActive(item.href) || isSubItemActive(item)

    const Icon = iconMap[item.icon] || null;

    return (
      <div key={item.name}>
        <Link
          href={hasSubItems ? '#' : item.href}
          onClick={hasSubItems ? (e) => { 
            e.preventDefault(); 
            onToggleExpanded(item.name) 
          } : (isMobile ? onMobileItemClick : undefined)}
          className={cn(
            'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
            isItemActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <div className="flex items-center">
            {Icon && <Icon className="mr-3 h-4 w-4" />}
            {item.name}
          </div>
          {hasSubItems && (
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          )}
        </Link>
        {hasSubItems && isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {(item.subItems ?? []).map((subItem) => {
              const SubIcon = iconMap[subItem.icon] || null;
              return (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  onClick={isMobile ? onMobileItemClick : undefined}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                    isActive(subItem.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {SubIcon && <SubIcon className="mr-3 h-4 w-4" />}
                  {subItem.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className={cn(
      "space-y-1",
      isMobile ? "space-y-1" : "mt-8 flex-1 px-2 space-y-1"
    )}>
      {navigationItems.map(renderNavItem)}
    </nav>
  )
} 