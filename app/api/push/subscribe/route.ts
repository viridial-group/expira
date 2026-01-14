import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const subscribeSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL'),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { endpoint, keys } = subscribeSchema.parse(body)

    // Get user agent
    const userAgent = request.headers.get('user-agent') || null

    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    })

    if (existing) {
      // Update existing subscription
      if (existing.userId !== user.id) {
        return NextResponse.json(
          { error: 'Subscription already exists for another user' },
          { status: 409 }
        )
      }

      const updated = await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent,
          enabled: true,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Subscription updated',
        subscription: updated,
      })
    }

    // Create new subscription
    const subscription = await prisma.pushSubscription.create({
      data: {
        userId: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
        enabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription created',
      subscription,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error subscribing to push notifications:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to push notifications' },
      { status: 500 }
    )
  }
}

