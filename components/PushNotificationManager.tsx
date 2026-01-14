'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui'
import toast from 'react-hot-toast'

interface PushNotificationManagerProps {
  className?: string
}

export default function PushNotificationManager({ className }: PushNotificationManagerProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    checkSupport()
  }, [])

  const checkSupport = async () => {
    if (typeof window === 'undefined') return

    // Check if browser supports notifications
    if (!('Notification' in window)) {
      setIsSupported(false)
      setIsLoading(false)
      return
    }

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      setIsSupported(false)
      setIsLoading(false)
      return
    }

    setIsSupported(true)
    setPermission(Notification.permission)

    // Check if already subscribed
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in your browser')
      return
    }

    if (permission === 'granted') {
      await subscribe()
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        await subscribe()
      } else if (result === 'denied') {
        toast.error('Notification permission denied. Please enable it in your browser settings.')
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
      toast.error('Failed to request notification permission')
    }
  }

  const subscribe = async () => {
    if (!isSupported) return

    setIsLoading(true)
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
        toast.error('Push notifications are not configured. Please contact support.')
        setIsLoading(false)
        return
      }

      // Convert VAPID key to ArrayBuffer
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(subscription.getKey('auth')!),
          },
        }),
      })

      if (response.ok) {
        setIsSubscribed(true)
        toast.success('Push notifications enabled!')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to enable push notifications')
      }
    } catch (error: any) {
      console.error('Error subscribing to push notifications:', error)
      if (error.name === 'NotAllowedError') {
        toast.error('Notification permission denied. Please enable it in your browser settings.')
      } else {
        toast.error('Failed to enable push notifications')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push service
        await subscription.unsubscribe()

        // Notify server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        })

        setIsSubscribed(false)
        toast.success('Push notifications disabled')
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      toast.error('Failed to disable push notifications')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string): BufferSource {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray.buffer
  }

  // Helper function to convert ArrayBuffer to base64
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  if (isLoading) {
    return (
      <Button variant="outline" disabled className={className}>
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent mr-2"></div>
        Loading...
      </Button>
    )
  }

  if (!isSupported) {
    return null // Don't show anything if not supported
  }

  if (permission === 'denied') {
    return (
      <div className={className}>
        <p className="text-sm text-gray-600">
          Notifications are blocked. Please enable them in your browser settings.
        </p>
      </div>
    )
  }

  return (
    <Button
      variant={isSubscribed ? 'secondary' : 'primary'}
      onClick={isSubscribed ? unsubscribe : requestPermission}
      className={className}
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4 mr-2" />
          Disable Push Notifications
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Enable Push Notifications
        </>
      )}
    </Button>
  )
}

