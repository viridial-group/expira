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
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Note: We would need to track SMS usage in the database
    // For now, we'll use a simple check
    // TODO: Implement SMS usage tracking
    const used = 0 // Placeholder - implement actual tracking

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
  // TODO: Implement SMS usage tracking
  // This would increment a counter in the database for the current month
  // For now, this is a placeholder
  console.log(`SMS sent for user ${userId}`)
}

