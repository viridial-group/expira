// Service Worker for Push Notifications
const CACHE_NAME = 'expira-push-v1'

// Install event - cache resources
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  return self.clients.claim()
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event)
  
  let notificationData = {
    title: 'expira',
    body: 'You have a new notification',
    icon: '/favicon.ico', // Fallback to favicon if icon doesn't exist
    badge: '/favicon.ico',
    tag: 'expira-notification',
    requireInteraction: false,
    data: {},
  }

  if (event.data) {
    try {
      const data = event.data.json()
      console.log('Push data parsed:', data)
      notificationData = {
        ...notificationData,
        title: data.title || notificationData.title,
        body: data.message || data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        requireInteraction: data.requireInteraction || false,
        data: data.data || {},
      }
    } catch (e) {
      console.error('Error parsing push data:', e)
      // Try to get text data
      if (event.data.text) {
        notificationData.body = event.data.text()
      }
    }
  } else {
    console.warn('Push event received without data')
  }

  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    data: notificationData.data,
    actions: notificationData.data.actions || [],
    vibrate: [200, 100, 200], // Vibration pattern
    timestamp: Date.now(),
  }

  console.log('Showing notification:', notificationData.title, notificationOptions)

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
      .then(() => {
        console.log('Notification displayed successfully')
      })
      .catch((error) => {
        console.error('Error showing notification:', error)
      })
  )
})

// Notification click event - handle user clicking on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/dashboard/notifications'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  // Optionally send analytics about notification dismissal
  console.log('Notification closed:', event.notification.tag)
})

