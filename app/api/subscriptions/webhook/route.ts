import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId

        if (!userId || !planId) {
          console.error('Missing metadata in checkout session')
          break
        }

        // Get subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Determine subscription status
        let status = 'active'
        if (subscription.status === 'trialing') {
          status = 'trialing'
        } else if (subscription.status === 'active') {
          status = 'active'
        } else if (subscription.status === 'canceled') {
          status = 'canceled'
        } else if (subscription.status === 'past_due') {
          status = 'past_due'
        }

        // Create or update subscription in database
        await prisma.subscription.upsert({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          update: {
            status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          },
          create: {
            userId,
            planId,
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          },
        })

        // Create notification
        await prisma.notification.create({
          data: {
            userId,
            type: 'email',
            title: 'Subscription Activated',
            message: `Your ${planId} subscription has been activated successfully!`,
          },
        })

        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Determine subscription status
        let status = 'active'
        if (subscription.status === 'trialing') {
          status = 'trialing'
        } else if (subscription.status === 'active') {
          status = 'active'
        } else if (subscription.status === 'canceled') {
          status = 'canceled'
        } else if (subscription.status === 'past_due') {
          status = 'past_due'
        }

        await prisma.subscription.updateMany({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          },
        })

        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription && invoice.payment_intent) {
          // Get subscription from database
          const dbSubscription = await prisma.subscription.findUnique({
            where: {
              stripeSubscriptionId: invoice.subscription as string,
            },
          })

          if (dbSubscription) {
            // Get payment intent details
            const paymentIntent = await stripe.paymentIntents.retrieve(
              invoice.payment_intent as string
            )

            // Create payment record
            await prisma.payment.create({
              data: {
                userId: dbSubscription.userId,
                subscriptionId: dbSubscription.id,
                stripePaymentIntentId: paymentIntent.id,
                stripeInvoiceId: invoice.id,
                amount: invoice.amount_paid,
                currency: invoice.currency || 'usd',
                status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
                description: invoice.description || `Payment for ${dbSubscription.planId} plan`,
                planId: dbSubscription.planId,
                periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
                periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
              },
            })
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const dbSubscription = await prisma.subscription.findUnique({
            where: {
              stripeSubscriptionId: invoice.subscription as string,
            },
          })

          if (dbSubscription && invoice.payment_intent) {
            await prisma.payment.create({
              data: {
                userId: dbSubscription.userId,
                subscriptionId: dbSubscription.id,
                stripePaymentIntentId: invoice.payment_intent as string,
                stripeInvoiceId: invoice.id,
                amount: invoice.amount_due,
                currency: invoice.currency || 'usd',
                status: 'failed',
                description: invoice.description || `Failed payment for ${dbSubscription.planId} plan`,
                planId: dbSubscription.planId,
                periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
                periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
              },
            })
          }
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

