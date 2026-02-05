"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { NotificationData, getNotificationsDataClient } from '@/lib/notifications-data-client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle, AlertCircle, Info, Check, Inbox, Clock, Trash2, Eye } from 'lucide-react'

interface NotificationsContentProps {
  initialNotifications: NotificationData[]
}

export default function NotificationsContent({ initialNotifications }: NotificationsContentProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>(initialNotifications || [])
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showRead, setShowRead] = useState(true)
  const [loading, setLoading] = useState(!initialNotifications?.length)
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  // Fallback to client fetch if SSR data is empty
  useEffect(() => {
    if (!initialNotifications || initialNotifications.length === 0) {
      setLoading(true)
      getNotificationsDataClient().then(data => {
        setNotifications(data)
        setLoading(false)
      })
    }
  }, [initialNotifications])

  const unreadCount = notifications.filter(n => n.status === 'unread').length
  const filteredNotifications = showRead 
    ? notifications 
    : notifications.filter(n => n.status === 'unread')

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'error':
        return 'border-l-red-500 bg-red-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  const handleReadMore = (notification: NotificationData) => {
    setSelectedNotification(notification)
    setIsModalOpen(true)
    // Mark as read when opening
    if (notification.status === 'unread') {
      handleMarkAsRead(notification.id)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Mark as read (API call)
  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' })
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n))
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      })
    }
  }

  // Mark all as read (API call)
  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => n.status === 'unread').map(n =>
          fetch(`/api/notifications/${n.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'read' })
          })
        )
      )
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })))
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      })
    }
  }

  // Delete selected (API call)
  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedNotifications.map(id =>
          fetch(`/api/notifications/${id}`, { method: 'DELETE' })
        )
      )
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)))
      setSelectedNotifications([])
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      })
    }
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(n => n !== id)
        : [...prev, id]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">
                Stay updated with your latest activities and important updates
              </p>
            </div>
            <div className="flex items-center gap-3">
              {notifications.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark all read
                  </Button>
                  {selectedNotifications.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelected}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete ({selectedNotifications.length})
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        {notifications.length > 0 && (
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant={showRead ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowRead(true)}
                >
                  All ({notifications.length})
                </Button>
                <Button
                  variant={!showRead ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowRead(false)}
                >
                  Unread ({unreadCount})
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {notifications.length === 0 ? (
            // Empty state
            <div className="px-8 py-16 text-center">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Inbox className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                No notifications yet
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We&apos;ll notify you when something important happens, like new property matches, 
                inquiry updates, or account activities.
              </p>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                <span>You&apos;re all caught up!</span>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            // No unread notifications
            <div className="px-8 py-16 text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                All caught up!
              </h2>
              <p className="text-gray-600 mb-6">
                You&apos;ve read all your notifications. Check back later for new updates.
              </p>
              <Button
                variant="outline"
                onClick={() => setShowRead(true)}
              >
                View all notifications
              </Button>
            </div>
          ) : (
            // Notifications list
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "px-6 py-4 hover:bg-gray-50 transition-colors",
                    getNotificationColor(notification.type),
                    selectedNotifications.includes(notification.id) && "bg-blue-50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatDate(notification.created_at)}
                            </span>
                            <div className="flex items-center gap-2">
                              {notification.status === 'unread' && (
                                <Badge variant="secondary" className="text-xs">
                                  New
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReadMore(notification)}
                                className="text-xs"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Read More
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={notification.status === 'read'}
                                className="text-xs"
                              >
                                {notification.status === 'read' ? 'Read' : 'Mark as read'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Notifications are automatically cleared after 30 days
            </p>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification && getNotificationIcon(selectedNotification.type)}
              {selectedNotification?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {selectedNotification?.message}
              </p>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>Category: {selectedNotification?.category}</span>
                <span>Type: {selectedNotification?.type}</span>
              </div>
              <span>{selectedNotification && formatDate(selectedNotification.created_at)}</span>
            </div>
            {selectedNotification?.creator_name && (
              <div className="text-sm text-gray-500">
                From: {selectedNotification.creator_name}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
              {selectedNotification && selectedNotification.status === 'unread' && (
                <Button
                  onClick={() => {
                    handleMarkAsRead(selectedNotification.id)
                    setIsModalOpen(false)
                  }}
                >
                  Mark as Read
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 