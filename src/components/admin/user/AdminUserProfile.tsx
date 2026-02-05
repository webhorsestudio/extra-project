'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  created_at?: string
  updated_at?: string
}

interface UserProfile {
  id: string
  full_name: string
  role: string
  avatar_url?: string
  avatar_data?: string
  created_at: string
  updated_at: string
}

interface AdminUserProfileProps {
  user: User
  profile: UserProfile | null
  loading: boolean
}

export function AdminUserProfile({ user, profile, loading }: AdminUserProfileProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/admin/signout', { method: 'POST' });
    router.push('/users/login');
  };

  if (loading) {
    return <Skeleton className="h-10 w-40" />
  }

  if (!user) {
    return (
      <Link href="/users/login">
        <Button variant="outline" size="sm">
          <UserIcon className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative flex items-center gap-3 h-10 px-2 rounded-full group">
          <Avatar className="h-10 w-10 border-2 border-white shadow-md">
            <AvatarImage src={profile?.avatar_data || profile?.avatar_url} alt={profile?.full_name} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {/* Show name and role on desktop */}
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-sm font-semibold text-gray-900 leading-tight">{profile?.full_name || 'Admin User'}</span>
            <span className="text-xs text-gray-500 font-medium capitalize">{profile?.role || 'admin'}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 mt-2 shadow-2xl backdrop-blur bg-white/90 border border-gray-100 rounded-xl p-0" align="end" forceMount>
        {/* Profile Info Row */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <Avatar className="h-12 w-12 border-2 border-gray-200 shadow">
            <AvatarImage src={profile?.avatar_data || profile?.avatar_url} alt={profile?.full_name} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-gray-900">{profile?.full_name || 'Admin User'}</span>
            <span className="text-xs text-gray-500 font-medium">{user.email}</span>
            <span className="text-xs text-blue-700 font-semibold capitalize mt-1">{profile?.role || 'admin'}</span>
          </div>
        </div>
        {/* Actions */}
        <DropdownMenuItem asChild className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
          <Link href="/admin/profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-red-600">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 