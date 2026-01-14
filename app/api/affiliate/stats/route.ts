import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { prisma } from '@/lib/db'
import { getOrCreateAffiliateCode } from '@/lib/affiliate'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Get or create affiliate code
    const code = await getOrCreateAffiliateCode(user.id, user.email)

    // Get affiliate code with stats
    const affiliateCode = await prisma.affiliateCode.findUnique({
      where: { code },
      include: {
        referrals: {
          include: {
            referredUser: {
              select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        commissions: {
          include: {
            payment: {
              select: {
                amount: true,
                currency: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!affiliateCode) {
      return NextResponse.json(
        { error: 'Code d\'affiliation introuvable' },
        { status: 404 }
      )
    }

    // Calculate stats
    const stats = {
      code: affiliateCode.code,
      totalReferrals: affiliateCode.totalReferrals,
      totalEarnings: affiliateCode.totalEarnings,
      pendingEarnings: affiliateCode.commissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.amount, 0),
      approvedEarnings: affiliateCode.commissions
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + c.amount, 0),
      paidEarnings: affiliateCode.commissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0),
      convertedReferrals: affiliateCode.referrals.filter(r => r.hasConverted).length,
      pendingReferrals: affiliateCode.referrals.filter(r => !r.hasConverted).length,
      totalCommissions: affiliateCode.commissions.length,
      pendingCommissions: affiliateCode.commissions.filter(c => c.status === 'pending').length,
    }

    // Format referrals
    const referrals = affiliateCode.referrals.map(ref => ({
      id: ref.id,
      referredUser: ref.referredUser,
      status: ref.status,
      hasConverted: ref.hasConverted,
      createdAt: ref.createdAt,
      convertedAt: ref.convertedAt,
    }))

    // Format commissions
    const commissions = affiliateCode.commissions.map(comm => ({
      id: comm.id,
      amount: comm.amount,
      commissionType: comm.commissionType,
      commissionRate: comm.commissionRate,
      status: comm.status,
      payment: comm.payment,
      createdAt: comm.createdAt,
      approvedAt: comm.approvedAt,
      paidAt: comm.paidAt,
    }))

    return NextResponse.json({
      stats,
      referrals,
      commissions,
    })
  } catch (error) {
    console.error('Error fetching affiliate stats:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

