'use client'

import { Badge } from '@/components/ui/badge'
import { Shield, User, Users } from 'lucide-react'

interface RoleBadgeProps {
  role: 'admin' | 'agent' | 'customer'
  size?: 'sm' | 'md' | 'lg'
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          icon: Shield,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
          iconClassName: 'text-red-600'
        }
      case 'agent':
        return {
          label: 'Agent',
          icon: Users,
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
          iconClassName: 'text-blue-600'
        }
      case 'customer':
        return {
          label: 'Customer',
          icon: User,
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
          iconClassName: 'text-gray-600'
        }
      default:
        return {
          label: role,
          icon: User,
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
          iconClassName: 'text-gray-600'
        }
    }
  }

  const config = getRoleConfig(role)
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1.5`}
    >
      <Icon className={`h-3 w-3 ${config.iconClassName}`} />
      {config.label}
    </Badge>
  )
} 