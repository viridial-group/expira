import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
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

    // Get user's subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
      },
    })

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Get invoices from Stripe
    const invoices = await stripe.invoices.list({
      subscription: subscription.stripeSubscriptionId,
      limit: 100,
    })

    let syncedCount = 0
    let errors: string[] = []

    for (const invoice of invoices.data) {
      if (invoice.payment_intent && invoice.status === 'paid') {
        try {
          // Check if payment already exists
          const existingPayment = await prisma.payment.findUnique({
            where: {
              stripePaymentIntentId: invoice.payment_intent as string,
            },
          })

          if (!existingPayment) {
            await prisma.payment.create({
              data: {
                userId: user.id,
                subscriptionId: subscription.id,
                stripePaymentIntentId: invoice.payment_intent as string,
                stripeInvoiceId: invoice.id,
                amount: invoice.amount_paid,
                currency: invoice.currency || 'usd',
                status: 'succeeded',
                description: invoice.description || `Payment for ${subscription.planId} plan`,
                planId: subscription.planId,
                periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
                periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
              },
            })
            syncedCount++
          }
        } catch (error: any) {
          errors.push(`Failed to sync invoice ${invoice.id}: ${error.message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      total: invoices.data.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Error syncing payments:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

