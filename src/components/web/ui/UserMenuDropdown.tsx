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
  Plus,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

// Proper TypeScript interfaces
interface User {
  name?: string
  avatar?: string | null
  role?: 'admin' | 'agent' | 'customer'
  email?: string
}

interface UserMenuDropdownProps {
  onClose: () => void
  user: User
}

interface MenuItem {
  label: string
  icon: React.ReactNode
  href?: string
  action?: () => void
}

export default function UserMenuDropdown({ onClose, user }: UserMenuDropdownProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSeller, setIsCheckingSeller] = useState(false)

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
    } catch {
      toast({
        title: 'Logout Failed',
        description: 'An error occurred during logout.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProperty = async () => {
    if (!user.email) {
      toast({
        title: 'Error',
        description: 'Email address is required to add properties.',
        variant: 'destructive',
      })
      return
    }

    setIsCheckingSeller(true)
    try {
      const response = await fetch('/api/check-seller-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.isSeller) {
          // User is a seller, redirect to property creation
          router.push('/properties/add')
          toast({
            title: 'Welcome back!',
            description: 'Redirecting to property creation form.',
          })
        } else {
          // User is not a seller, redirect to seller registration
          router.push('/seller-registration')
          toast({
            title: 'Seller Registration Required',
            description: 'Please register as a seller to add properties.',
          })
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to check seller status.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to check seller status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsCheckingSeller(false)
      onClose()
    }
  }

  const menuItems: MenuItem[] = [
    { label: 'Wishlist', icon: <Heart className="w-6 h-6" />, href: '/wishlist' },
    { label: 'Profile', icon: <User className="w-6 h-6" />, href: '/profile' },
    { label: 'Notification', icon: <MessageSquare className="w-6 h-6" />, href: '/notifications' },
    { label: 'Add Property', icon: <Plus className="w-6 h-6" />, action: handleAddProperty },
    { label: 'Contact Us', icon: <Phone className="w-6 h-6" />, href: '/contact' },
    { label: 'Support', icon: <Headphones className="w-6 h-6" />, href: '/support' },
    { label: 'Terms Of Use', icon: <FileText className="w-6 h-6" />, href: '/terms' },
    { label: 'Privacy Policy', icon: <FileText className="w-6 h-6" />, href: '/privacy' },
    { label: 'FAQs', icon: <HelpCircle className="w-6 h-6" />, href: '/faqs' },
  ]

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
            {item.action ? (
              <button
                type="button"
                onClick={item.action}
                disabled={isCheckingSeller}
                className="flex items-center gap-4 px-5 py-3 text-base text-[#222] hover:bg-gray-50 rounded-lg w-full text-left transition-colors focus:bg-gray-100 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                tabIndex={0}
              >
                {item.icon}
                <span>{isCheckingSeller && item.label === 'Add Property' ? 'Checking...' : item.label}</span>
              </button>
            ) : item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-4 px-5 py-3 text-base text-[#222] hover:bg-gray-50 rounded-lg transition-colors focus:bg-gray-100 outline-none"
                tabIndex={0}
                onClick={onClose}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ) : null}
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