import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createCommission } from '@/lib/affiliate'
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
        const dbSubscription = await prisma.subscription.upsert({
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

        // If payment was made immediately (no trial or trial ended), create payment record
        if (session.payment_status === 'paid' && session.payment_intent) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(
              session.payment_intent as string
            )

            // Check if payment already exists
            const existingPayment = await prisma.payment.findUnique({
              where: {
                stripePaymentIntentId: paymentIntent.id,
              },
            })

            if (!existingPayment && paymentIntent.status === 'succeeded') {
              // Get invoice if available
              let invoice = null
              if (session.invoice) {
                try {
                  invoice = await stripe.invoices.retrieve(session.invoice as string)
                } catch (err) {
                  console.error('Error retrieving invoice:', err)
                }
              }

              await prisma.payment.create({
                data: {
                  userId,
                  subscriptionId: dbSubscription.id,
                  stripePaymentIntentId: paymentIntent.id,
                  stripeInvoiceId: invoice?.id || null,
                  amount: paymentIntent.amount,
                  currency: paymentIntent.currency || 'usd',
                  status: 'succeeded',
                  description: invoice?.description || `Payment for ${planId} plan`,
                  planId,
                  periodStart: invoice?.period_start ? new Date(invoice.period_start * 1000) : null,
                  periodEnd: invoice?.period_end ? new Date(invoice.period_end * 1000) : null,
                },
              })
            }
          } catch (paymentError) {
            console.error('Error creating payment from checkout session:', paymentError)
            // Don't fail the webhook if payment creation fails
          }
        }

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
            include: {
              user: {
                select: {
                  id: true,
                  referredByAffiliateCode: true,
                },
              },
            },
          })

          if (dbSubscription) {
            // Get payment intent details
            const paymentIntent = await stripe.paymentIntents.retrieve(
              invoice.payment_intent as string
            )

            // Create payment record
            const payment = await prisma.payment.create({
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

            // Check if user was referred and create commission
            if (dbSubscription.user.referredByAffiliateCode && invoice.amount_paid > 0) {
              try {
                // Find referral
                const referral = await prisma.affiliateReferral.findFirst({
                  where: {
                    referredUserId: dbSubscription.userId,
                    status: { in: ['pending', 'converted'] },
                  },
                })

                if (referral) {
                  // Determine commission type based on subscription count
                  const existingCommissions = await prisma.affiliateCommission.count({
                    where: {
                      referralId: referral.id,
                    },
                  })

                  const commissionType = existingCommissions === 0 
                    ? 'subscription' // First subscription payment
                    : 'recurring'    // Recurring payment

                  // Create commission
                  await createCommission(
                    referral.id,
                    payment.id,
                    invoice.amount_paid,
                    commissionType
                  )
                }
              } catch (commissionError) {
                // Log error but don't fail webhook processing
                console.error('Error creating affiliate commission:', commissionError)
              }
            }
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
            // Check if payment already exists
            const existingPayment = await prisma.payment.findUnique({
              where: {
                stripePaymentIntentId: invoice.payment_intent as string,
              },
            })

            if (!existingPayment) {
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
        }

        break
      }

      case 'payment_intent.succeeded': {
        // Backup handler for payment intents that might not have invoices yet
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Only process if it's related to a subscription
        if (paymentIntent.metadata?.subscription_id) {
          try {
            const subscription = await stripe.subscriptions.retrieve(
              paymentIntent.metadata.subscription_id
            )

            const dbSubscription = await prisma.subscription.findUnique({
              where: {
                stripeSubscriptionId: subscription.id,
              },
            })

            if (dbSubscription) {
              // Check if payment already exists
              const existingPayment = await prisma.payment.findUnique({
                where: {
                  stripePaymentIntentId: paymentIntent.id,
                },
              })

              if (!existingPayment) {
                await prisma.payment.create({
                  data: {
                    userId: dbSubscription.userId,
                    subscriptionId: dbSubscription.id,
                    stripePaymentIntentId: paymentIntent.id,
                    stripeInvoiceId: null,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency || 'usd',
                    status: 'succeeded',
                    description: `Payment for ${dbSubscription.planId} plan`,
                    planId: dbSubscription.planId,
                    periodStart: null,
                    periodEnd: null,
                  },
                })
              }
            }
          } catch (error) {
            console.error('Error processing payment_intent.succeeded:', error)
            // Don't fail the webhook
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

