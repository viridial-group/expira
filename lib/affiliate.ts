// Utility functions for affiliate system

import { prisma } from '@/lib/db'

/**
 * Generate a unique affiliate code for a user
 */
export function generateAffiliateCode(userId: string, email: string): string {
  // Generate code from user ID + email hash
  const hash = email.split('@')[0].toUpperCase().substring(0, 4)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${hash}${random}`
}

/**
 * Create or get affiliate code for a user
 */
export async function getOrCreateAffiliateCode(userId: string, userEmail: string): Promise<string> {
  let affiliateCode = await prisma.affiliateCode.findUnique({
    where: { userId },
    select: { code: true },
  })

  if (!affiliateCode) {
    // Generate a unique code
    let code: string = ''
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      code = generateAffiliateCode(userId, userEmail)
      const existing = await prisma.affiliateCode.findUnique({
        where: { code },
      })

      if (!existing) {
        isUnique = true
      } else {
        attempts++
      }
    }

    if (!isUnique || !code) {
      // Fallback: use userId + timestamp
      code = `REF${userId.substring(0, 8).toUpperCase()}${Date.now().toString(36).toUpperCase()}`
    }

    // Create affiliate code
    await prisma.affiliateCode.create({
      data: {
        userId,
        code,
      },
    })

    return code
  }

  return affiliateCode.code
}

/**
 * Validate affiliate code
 */
export async function validateAffiliateCode(code: string): Promise<{ valid: boolean; userId?: string; message?: string }> {
  if (!code || code.trim().length === 0) {
    return { valid: false, message: 'Code d\'affiliation requis' }
  }

  const affiliateCode = await prisma.affiliateCode.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  })

  if (!affiliateCode) {
    return { valid: false, message: 'Code d\'affiliation invalide' }
  }

  if (!affiliateCode.isActive) {
    return { valid: false, message: 'Ce code d\'affiliation est désactivé' }
  }

  return {
    valid: true,
    userId: affiliateCode.userId,
  }
}

/**
 * Create referral when user signs up with affiliate code
 */
export async function createReferral(referredUserId: string, affiliateCode: string): Promise<void> {
  const code = await prisma.affiliateCode.findUnique({
    where: { code: affiliateCode.toUpperCase() },
  })

  if (!code) {
    throw new Error('Code d\'affiliation invalide')
  }

  // Check if referral already exists
  const existing = await prisma.affiliateReferral.findUnique({
    where: { referredUserId },
  })

  if (existing) {
    return // Already referred
  }

  // Create referral
  await prisma.affiliateReferral.create({
    data: {
      affiliateCodeId: code.id,
      affiliateUserId: code.userId,
      referredUserId,
      status: 'pending',
    },
  })

  // Update affiliate code stats
  await prisma.affiliateCode.update({
    where: { id: code.id },
    data: {
      totalReferrals: {
        increment: 1,
      },
    },
  })
}

/**
 * Calculate commission for a payment
 */
export function calculateCommission(amount: number, commissionType: 'signup' | 'subscription' | 'recurring'): number {
  // Commission rates (adjust based on your business model)
  const rates: Record<string, number> = {
    signup: 0.1,      // 10% for signup bonuses
    subscription: 0.15, // 15% for first subscription
    recurring: 0.05,    // 5% for recurring subscriptions
  }

  const rate = rates[commissionType] || 0
  return Math.round(amount * rate)
}

/**
 * Create commission when referral converts (subscribes)
 */
export async function createCommission(
  referralId: string,
  paymentId: string,
  amount: number,
  commissionType: 'signup' | 'subscription' | 'recurring' = 'subscription'
): Promise<void> {
  const referral = await prisma.affiliateReferral.findUnique({
    where: { id: referralId },
    include: {
      affiliateCode: true,
    },
  })

  if (!referral) {
    throw new Error('Référence introuvable')
  }

  // Calculate commission
  const commissionAmount = calculateCommission(amount, commissionType)

  if (commissionAmount <= 0) {
    return // No commission
  }

  // Check if commission already exists
  const existing = await prisma.affiliateCommission.findUnique({
    where: { referralId },
  })

  if (existing) {
    return // Commission already created
  }

  // Create commission
  await prisma.affiliateCommission.create({
    data: {
      affiliateCodeId: referral.affiliateCodeId,
      affiliateUserId: referral.affiliateUserId,
      referralId,
      paymentId,
      amount: commissionAmount,
      commissionType,
      commissionRate: commissionType === 'signup' ? 0.1 : commissionType === 'subscription' ? 0.15 : 0.05,
      status: 'pending',
    },
  })

  // Update referral status
  await prisma.affiliateReferral.update({
    where: { id: referralId },
    data: {
      hasConverted: true,
      status: 'converted',
      convertedAt: new Date(),
    },
  })

  // Update affiliate code stats
  await prisma.affiliateCode.update({
    where: { id: referral.affiliateCodeId },
    data: {
      totalEarnings: {
        increment: commissionAmount,
      },
    },
  })
}

