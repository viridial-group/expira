'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Check, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Card, Badge } from '@/components/ui'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [id], read: true }),
      })

      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
      }
    } catch (error) {
      toast.error('Failed to update notification')
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) return

    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: unreadIds, read: true }),
      })

      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
        toast.success('All notifications marked as read')
      }
    } catch (error) {
      toast.error('Failed to update notifications')
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600">Stay updated with all your product alerts</p>
      </div>
      
      <Card padding="none" className="shadow-xl border-0">
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-white via-gray-50/50 to-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <Badge variant="primary" size="md" className="shadow-md">
                {unreadCount} new
              </Badge>
            )}
            <h2 className="text-xl font-bold text-gray-900">All Notifications</h2>
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="md" onClick={markAllAsRead} className="shadow-md">
              Mark all as read
            </Button>
          )}
        </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-blue-100 rounded-full mb-6">
                <Bell className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-600">You&apos;ll see alerts here when your products need attention</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary-50/30 transition-all group border-l-4 ${
                    !notification.read ? 'bg-primary-50/50 border-primary-500' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3 gap-3">
                        <h3 className="font-bold text-gray-900 text-lg">{notification.title}</h3>
                        {!notification.read && (
                          <span className="h-2.5 w-2.5 bg-primary-600 rounded-full animate-pulse shadow-lg"></span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">{notification.message}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="ml-4 p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                        title="Mark as read"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </Card>
    </div>
  )
}

