import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, source, metadata } = subscribeSchema.parse(body)

    // Check if email already exists
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      // If unsubscribed, reactivate
      if (existing.status === 'unsubscribed') {
        const updated = await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            status: 'active',
            name: name || existing.name,
            source: source || existing.source,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            metadata: (metadata || existing.metadata || {}) as Prisma.InputJsonValue,
          },
        })
        return NextResponse.json({
          success: true,
          message: 'Successfully resubscribed!',
          subscriber: updated,
        })
      }

      // Already subscribed
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed!',
        subscriber: existing,
      })
    }

    // Create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        source: source || 'landing_page',
        status: 'active',
        metadata: (metadata || {}) as Prisma.InputJsonValue,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!',
      subscriber,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
}

