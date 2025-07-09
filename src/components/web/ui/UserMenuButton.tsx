"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import AvatarCircle from './AvatarCircle'
import MenuIcon from './MenuIcon'
import UserMenuDropdown from './UserMenuDropdown'
import { Skeleton } from '@/components/ui/skeleton'

interface User {
  name?: string
  avatar?: string | null
  role?: 'admin' | 'agent' | 'customer'
}

interface UserMenuButtonProps {
  user?: User | null
  onSignIn?: () => void
  isLoading?: boolean
}

export default function UserMenuButton({ user, onSignIn, isLoading = false }: UserMenuButtonProps) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Show loading skeleton while checking authentication
  if (isLoading) {
    return <Skeleton className="h-10 w-24 rounded-full" />
  }

  if (!user) {
    return (
      <Button
        onClick={onSignIn}
        variant="outline"
        className="px-5 py-2 rounded-full border border-gray-300 bg-white text-[#2C3550] font-semibold shadow-sm hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Sign in to your account"
      >
        Sign In
      </Button>
    )
  }

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="outline"
        className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-gray-400 bg-white hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        style={{ minWidth: 70 }}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`User menu for ${user.name || 'User'}`}
      >
        <AvatarCircle src={user.avatar} size={32} />
        <MenuIcon size={28} color="#2C3550" />
      </Button>
      {open && (
        <div ref={dropdownRef}>
          <UserMenuDropdown user={user} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
} 