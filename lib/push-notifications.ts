import { prisma } from './db'

// Dynamic import for web-push (CommonJS module)
let webpush: any

// Initialize web-push with VAPID keys
async function initWebPush() {
  if (!webpush) {
    webpush = await import('web-push')
  }
  
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@expira.io'

  if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
  }
}

export interface PushNotificationPayload {
  title: string
  message: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  url?: string
  data?: any
}

/**
 * Send push notification to a specific user
 */
export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured. Push notifications disabled.')
    return { sent: 0, failed: 0 }
  }

  await initWebPush()

  // Get all enabled subscriptions for the user
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      userId,
      enabled: true,
    },
  })

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 }
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    message: payload.message,
    body: payload.message,
    icon: payload.icon || '/icon-192x192.png',
    badge: payload.badge || '/icon-192x192.png',
    tag: payload.tag || 'expira-notification',
    requireInteraction: payload.requireInteraction || false,
    data: {
      url: payload.url || '/dashboard/notifications',
      ...payload.data,
    },
  })

  let sent = 0
  let failed = 0
  const failedSubscriptions: string[] = []

  // Send to all subscriptions
  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        notificationPayload
      )
      sent++
    } catch (error: any) {
      console.error('Error sending push notification:', error)
      failed++
      failedSubscriptions.push(subscription.id)

      // If subscription is invalid (410 Gone), disable it
      if (error.statusCode === 410) {
        await prisma.pushSubscription.update({
          where: { id: subscription.id },
          data: { enabled: false },
        })
      }
    }
  }

  // Remove failed subscriptions if they're permanently invalid
  if (failedSubscriptions.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: {
        id: { in: failedSubscriptions },
      },
    })
  }

  return { sent, failed }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToUsers(
  userIds: string[],
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  let totalSent = 0
  let totalFailed = 0

  for (const userId of userIds) {
    const result = await sendPushNotification(userId, payload)
    totalSent += result.sent
    totalFailed += result.failed
  }

  return { sent: totalSent, failed: totalFailed }
}

/**
 * Get user's push subscription status
 */
export async function getUserPushSubscriptionStatus(userId: string): Promise<{
  subscribed: boolean
  count: number
}> {
  const count = await prisma.pushSubscription.count({
    where: {
      userId,
      enabled: true,
    },
  })

  return {
    subscribed: count > 0,
    count,
  }
}

