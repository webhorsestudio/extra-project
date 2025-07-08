'use client'

import { Badge } from '@/components/ui/badge'
import { Circle, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface InquiryStatusBadgeProps {
  status: 'unread' | 'read' | 'in_progress' | 'resolved' | 'closed' | 'spam'
  className?: string
}

export function InquiryStatusBadge({ status, className = '' }: InquiryStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'unread':
        return {
          label: 'Unread',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: <Circle className="h-2 w-2 fill-red-600" />
        }
      case 'read':
        return {
          label: 'Read',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Circle className="h-2 w-2 fill-blue-600" />
        }
      case 'in_progress':
        return {
          label: 'In Progress',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="h-2 w-2 fill-yellow-600" />
        }
      case 'resolved':
        return {
          label: 'Resolved',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-2 w-2 fill-green-600" />
        }
      case 'closed':
        return {
          label: 'Closed',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <XCircle className="h-2 w-2 fill-gray-600" />
        }
      case 'spam':
        return {
          label: 'Spam',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <AlertTriangle className="h-2 w-2 fill-orange-600" />
        }
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Circle className="h-2 w-2 fill-gray-600" />
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${className} flex items-center gap-1 text-xs font-medium`}
    >
      {config.icon}
      {config.label}
    </Badge>
  )
}
