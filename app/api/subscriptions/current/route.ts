import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

const planDetails: Record<string, { name: string; price: number; features: string[]; smsEnabled: boolean; smsLimit: number }> = {
  starter: {
    name: 'Starter',
    price: 9,
    features: [
      'Up to 10 products',
      'Daily checks',
      'Email notifications',
      'Basic analytics',
      'Email support',
    ],
    smsEnabled: false,
    smsLimit: 0,
  },
  professional: {
    name: 'Professional',
    price: 29,
    features: [
      'Up to 100 products',
      'Hourly checks',
      'Email + SMS notifications',
      'Up to 500 SMS/month',
      'Advanced analytics',
      'Priority support',
      'API access',
    ],
    smsEnabled: true,
    smsLimit: 500,
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    features: [
      'Unlimited products',
      'Real-time monitoring',
      'All notification types',
      'Unlimited SMS',
      'Custom reports',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    smsEnabled: true,
    smsLimit: -1, // unlimited
  },
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get subscription from database
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        paymentMethod: null,
      })
    }

    // Get payment method from Stripe
    let paymentMethod = null
    if (subscription.stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(subscription.stripeCustomerId)
        if (customer && !customer.deleted) {
          const paymentMethods = await stripe.paymentMethods.list({
            customer: subscription.stripeCustomerId,
            type: 'card',
          })

          if (paymentMethods.data.length > 0) {
            const pm = paymentMethods.data[0]
            paymentMethod = {
              id: pm.id,
              brand: pm.card?.brand,
              last4: pm.card?.last4,
              expMonth: pm.card?.exp_month,
              expYear: pm.card?.exp_year,
            }
          }
        }
      } catch (error) {
        console.error('Error fetching payment method:', error)
      }
    }

    // Get plan details
    const plan = planDetails[subscription.planId] || planDetails.starter

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        planId: subscription.planId,
        planName: plan.name,
        price: plan.price,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        createdAt: subscription.createdAt,
      },
      paymentMethod,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

