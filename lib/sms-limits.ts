// SMS Limits and Plan Checking
import { prisma } from './db'
import { STRIPE_PLANS } from './stripe-config'

export async function canSendSMS(userId: string): Promise<{ allowed: boolean; reason?: string; limit?: number; used?: number }> {
  try {
    // Get user's subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['active', 'trialing'] },
      },
    })

    // If no subscription, check if user is on free tier (no SMS)
    if (!subscription) {
      return {
        allowed: false,
        reason: 'SMS notifications are available in Professional and Enterprise plans',
      }
    }

    const planId = subscription.planId as keyof typeof STRIPE_PLANS
    const plan = STRIPE_PLANS[planId]

    if (!plan) {
      return {
        allowed: false,
        reason: 'Invalid plan',
      }
    }

    // Check if SMS is enabled for this plan
    if (!plan.limits.smsEnabled) {
      return {
        allowed: false,
        reason: 'SMS notifications are not available in your current plan. Upgrade to Professional or Enterprise.',
      }
    }

    // Check SMS limit
    const limit = plan.limits.smsPerMonth
    if (limit === -1) {
      // Unlimited
      return {
        allowed: true,
        limit: -1,
      }
    }

    // Count SMS sent this month
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // 1-12
    const currentYear = now.getFullYear()

    // Get or create SMS usage record for this month
    const smsUsage = await prisma.sMSUsage.upsert({
      where: {
        userId_month_year: {
          userId,
          month: currentMonth,
          year: currentYear,
        },
      },
      create: {
        userId,
        month: currentMonth,
        year: currentYear,
        count: 0,
      },
      update: {},
    })

    const used = smsUsage.count

    if (used >= limit) {
      return {
        allowed: false,
        reason: `You've reached your monthly SMS limit of ${limit}. Upgrade to Enterprise for unlimited SMS.`,
        limit,
        used,
      }
    }

    return {
      allowed: true,
      limit,
      used,
    }
  } catch (error) {
    console.error('Error checking SMS limits:', error)
    return {
      allowed: false,
      reason: 'Error checking SMS limits',
    }
  }
}

export async function recordSMSSent(userId: string): Promise<void> {
  try {
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // 1-12
    const currentYear = now.getFullYear()

    // Increment SMS count for this month
    await prisma.sMSUsage.upsert({
      where: {
        userId_month_year: {
          userId,
          month: currentMonth,
          year: currentYear,
        },
      },
      create: {
        userId,
        month: currentMonth,
        year: currentYear,
        count: 1,
      },
      update: {
        count: {
          increment: 1,
        },
      },
    })
  } catch (error) {
    console.error('Error recording SMS usage:', error)
    // Don't throw - SMS was sent, just tracking failed
  }
}

