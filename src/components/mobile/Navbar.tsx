'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Building2, 
  FileText, 
  Phone, 
  MoreHorizontal 
} from 'lucide-react'
import { BrandingData } from '@/lib/branding'

interface User {
  name?: string
  avatar?: string | null
  role?: string
}

interface MobileNavbarProps {
  brandingData?: BrandingData
  user?: User | null
}

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/properties',
    label: 'Properties',
    icon: Building2,
  },
  {
    href: '/blogs',
    label: 'Blogs',
    icon: FileText,
  },
  {
    href: '/contact',
    label: 'Contact',
    icon: Phone,
  },
  {
    href: '/more',
    label: 'More',
    icon: MoreHorizontal,
  },
]

export default function MobileNavbar({ brandingData, user }: MobileNavbarProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 