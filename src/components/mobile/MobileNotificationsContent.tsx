"use client";
import React, { useEffect, useState } from 'react';
import { Bell, Inbox, Clock, CheckCircle, AlertCircle, Info, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFooterVisible } from '@/components/mobile/FooterVisibleContext';
import FooterNav from '@/components/mobile/FooterNav';
import type { NotificationData } from '@/lib/notifications-data-client';

interface MobileNotificationsContentProps {
  initialNotifications: NotificationData[] | null;
}

export default function MobileNotificationsContent({ initialNotifications }: MobileNotificationsContentProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>(initialNotifications ?? []);
  const [showRead, setShowRead] = useState(true);
  const [loading, setLoading] = useState(!initialNotifications);
  const footerVisible = useFooterVisible();

  useEffect(() => {
    if (!initialNotifications) {
      setLoading(true);
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          setNotifications(data.notifications || []);
          setLoading(false);
        });
    }
  }, [initialNotifications]);

  if (initialNotifications === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-6">
        <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Bell className="h-10 w-10 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view notifications</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Please log in to receive important updates and alerts.
        </p>
        <Button size="lg" asChild>
          <a href="/users/login">Sign In</a>
        </Button>
        <FooterNav visible={footerVisible} isTablet={false} />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const filteredNotifications = showRead ? notifications : notifications.filter(n => n.status === 'unread');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Mark as read (API call)
  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
    } catch (e) {}
  };

  // Mark all as read (API call)
  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => n.status === 'unread').map(n =>
          fetch(`/api/notifications/${n.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'read' }),
          })
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    } catch (e) {}
  };

  // Delete all notifications (API call)
  const handleDeleteAll = async () => {
    try {
      await Promise.all(
        notifications.map(n =>
          fetch(`/api/notifications/${n.id}`, { method: 'DELETE' })
        )
      );
      setNotifications([]);
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Bell className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1 text-sm">Stay updated with your latest activities</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {unreadCount} Unread
        </Badge>
      </div>

      {/* Filters and Actions */}
      {notifications.length > 0 && (
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant={showRead ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowRead(true)}
            >
              All
            </Button>
            <Button
              variant={!showRead ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowRead(false)}
            >
              Unread
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete all
            </Button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="px-4 py-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Inbox className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You have no notifications at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 rounded-xl shadow-sm border bg-white ${
                  n.status === 'unread' ? 'border-blue-400' : 'border-gray-200'
                }`}
                onClick={() => handleMarkAsRead(n.id)}
                role="button"
                tabIndex={0}
              >
                <div className="mt-1">{getNotificationIcon(n.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${n.status === 'unread' ? 'text-blue-900' : 'text-gray-900'}`}>
                      {n.title}
                    </span>
                    {n.status === 'unread' && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-gray-700 text-sm mt-1 line-clamp-3">
                    {n.message}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(n.created_at)}</span>
                    {n.creator_name && <span className="ml-2">By {n.creator_name}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 