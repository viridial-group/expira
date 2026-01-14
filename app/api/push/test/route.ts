import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { sendPushNotification } from '@/lib/push-notifications'

/**
 * Endpoint de test pour envoyer une push notification
 * GET /api/push/test
 * 
 * Usage:
 * - Ouvrez la console du navigateur
 * - Appelez: fetch('/api/push/test')
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Envoyer une notification de test
    const result = await sendPushNotification(user.id, {
      title: 'Test Notification',
      message: 'Ceci est une notification de test. Si vous voyez ce message, les push notifications fonctionnent !',
      url: '/dashboard/notifications',
      tag: 'test-notification',
      requireInteraction: false,
    })

    if (result.sent === 0) {
      return NextResponse.json({
        success: false,
        message: 'Aucune notification envoyée. Vérifiez que vous êtes abonné aux push notifications.',
        result,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Notification de test envoyée à ${result.sent} appareil(s)`,
      result,
    })
  } catch (error: any) {
    console.error('Error sending test push notification:', error)
    return NextResponse.json(
      {
        error: 'Failed to send test notification',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

