"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Heart,
  User,
  Phone,
  Headphones,
  FileText,
  HelpCircle,
  LogOut,
  MessageSquare,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

// Proper TypeScript interfaces
interface User {
  name?: string
  avatar?: string | null
  role?: 'admin' | 'agent' | 'customer'
}

interface UserMenuDropdownProps {
  onClose: () => void
  user: User
}

interface MenuItem {
  label: string
  icon: React.ReactNode
  href: string
}

const menuItems: MenuItem[] = [
  { label: 'Wishlist', icon: <Heart className="w-6 h-6" />, href: '/wishlist' },
  { label: 'Profile', icon: <User className="w-6 h-6" />, href: '/profile' },
  { label: 'Notification', icon: <MessageSquare className="w-6 h-6" />, href: '/notifications' },
  { label: 'Contact Us', icon: <Phone className="w-6 h-6" />, href: '/contact' },
  { label: 'Support', icon: <Headphones className="w-6 h-6" />, href: '/support' },
  { label: 'Terms Of Use', icon: <FileText className="w-6 h-6" />, href: '/terms' },
  { label: 'Privacy Policy', icon: <FileText className="w-6 h-6" />, href: '/privacy' },
  { label: 'FAQs', icon: <HelpCircle className="w-6 h-6" />, href: '/faqs' },
]

export default function UserMenuDropdown({ onClose, user }: UserMenuDropdownProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: 'Logout Failed',
          description: error.message || 'An error occurred during logout.',
          variant: 'destructive',
        })
        setIsLoading(false)
        return;
      }
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      })
      onClose();
      router.push('/users/login');
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: error instanceof Error ? error.message : 'An error occurred during logout.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-3 z-50"
      tabIndex={-1}
      onBlur={onClose}
    >
      <ul className="flex flex-col gap-1">
        {user?.role === 'admin' && (
          <>
            <li>
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-4 px-5 py-3 text-base text-[#222] hover:bg-gray-50 rounded-lg transition-colors focus:bg-gray-100 outline-none"
                tabIndex={0}
                onClick={onClose}
              >
                <User className="w-6 h-6" />
                <span>Admin Panel</span>
              </Link>
            </li>
            <li className="px-5 py-2">
              <div className="border-t border-gray-200"></div>
            </li>
          </>
        )}
        {menuItems.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="flex items-center gap-4 px-5 py-3 text-base text-[#222] hover:bg-gray-50 rounded-lg transition-colors focus:bg-gray-100 outline-none"
              tabIndex={0}
              onClick={onClose}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-3 text-base text-[#222] hover:bg-gray-50 rounded-lg w-full text-left transition-colors focus:bg-gray-100 outline-none cursor-pointer"
            tabIndex={0}
            disabled={isLoading}
          >
            <LogOut className="w-6 h-6" />
            <span>{isLoading ? 'Logging out…' : 'Log Out'}</span>
          </button>
        </li>
      </ul>
    </div>
  )
} 