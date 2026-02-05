'use client'

import { PopupAd, PopupAdType, PopupAdStatus } from '@/types/popup-ad'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Smartphone, Monitor, Tablet } from 'lucide-react'
import Image from 'next/image'

interface PopupAdCardProps {
  popupAd: PopupAd
  onEdit: () => void
  onDelete: () => void
}

export function PopupAdCard({ popupAd, onEdit, onDelete }: PopupAdCardProps) {
  const getStatusColor = (status: PopupAdStatus) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: PopupAdType) => {
    switch (type) {
      case 'banner':
        return '🎯'
      case 'modal':
        return '🪟'
      case 'toast':
        return '🍞'
      case 'slide_in':
        return '➡️'
      case 'fullscreen':
        return '🖥️'
      default:
        return '📢'
    }
  }

  const getPositionLabel = (position: string) => {
    return position.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors break-words leading-tight">
              {popupAd.title}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1 font-mono">
              {popupAd.slug}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Badge className={getStatusColor(popupAd.status)}>
              {popupAd.status}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {getTypeIcon(popupAd.type)}
              {popupAd.type}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Image Preview */}
        {popupAd.image_url && (
          <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={popupAd.image_url}
              alt={popupAd.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content Preview */}
        <div className="space-y-2">
          {popupAd.content.title && (
            <h4 className="font-medium text-gray-900">{popupAd.content.title}</h4>
          )}
          {popupAd.content.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {popupAd.content.description}
            </p>
          )}
        </div>

        {/* Platform Support */}
        <div className="flex items-center gap-2">
          {popupAd.show_on_mobile && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              Mobile
            </Badge>
          )}
          {popupAd.show_on_desktop && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              Desktop
            </Badge>
          )}
          {popupAd.show_on_tablet && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Tablet className="h-3 w-3" />
              Tablet
            </Badge>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Position:</span>
            <p className="font-medium">{getPositionLabel(popupAd.position)}</p>
          </div>
          <div>
            <span className="text-gray-500">Priority:</span>
            <p className="font-medium">{popupAd.priority}</p>
          </div>
          <div>
            <span className="text-gray-500">Delay:</span>
            <p className="font-medium">{popupAd.display_delay}s</p>
          </div>
          <div>
            <span className="text-gray-500">Duration:</span>
            <p className="font-medium">
              {popupAd.display_duration === 0 ? 'Until dismissed' : `${popupAd.display_duration}s`}
            </p>
          </div>
        </div>

        {/* Dates */}
        {(popupAd.start_date || popupAd.end_date) && (
          <div className="text-sm text-gray-500">
            {popupAd.start_date && (
              <p>From: {formatDate(popupAd.start_date)}</p>
            )}
            {popupAd.end_date && (
              <p>To: {formatDate(popupAd.end_date)}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
