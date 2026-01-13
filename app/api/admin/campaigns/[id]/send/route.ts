import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { prisma } from '@/lib/db'
import { sendEmailNotification } from '@/lib/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.status === 'sending' || campaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Campaign already sent or currently sending' },
        { status: 400 }
      )
    }

    // Update status to sending
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: { status: 'sending' },
    })

    // Get recipients based on recipientType
    let recipients: string[] = []

    if (campaign.recipientType === 'custom' && campaign.recipientEmails) {
      try {
        const emails = campaign.recipientEmails as unknown as string[]
        if (Array.isArray(emails)) {
          recipients = emails.filter((email): email is string => typeof email === 'string' && email.length > 0)
        }
      } catch (error) {
        console.error('Error parsing recipientEmails:', error)
        recipients = []
      }
    } else {
      // Build where clause for user query
      const where: any = {}
      if (campaign.recipientType === 'active') {
        where.subscriptions = {
          some: {
            status: 'active',
          },
        }
      } else if (campaign.recipientType === 'trialing') {
        where.subscriptions = {
          some: {
            status: 'trialing',
          },
        }
      } else if (campaign.recipientType === 'canceled') {
        where.subscriptions = {
          some: {
            status: 'canceled',
          },
        }
      }
      // "all" means all users, no filter needed

      const users = await prisma.user.findMany({
        where,
        select: {
          email: true,
        },
      })

      recipients = users.map(u => u.email)
    }

    // Send emails in batches to avoid overwhelming the server
    const batchSize = 10
    let sentCount = 0
    let failedCount = 0

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      
      await Promise.allSettled(
        batch.map(async (email) => {
          try {
            await sendEmailNotification(
              email,
              campaign.subject,
              campaign.content
            )
            sentCount++
          } catch (error) {
            console.error(`Failed to send email to ${email}:`, error)
            failedCount++
          }
        })
      )

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: 'sent',
        sentCount,
        failedCount,
        sentAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: recipients.length,
    })
  } catch (error) {
    console.error('Error sending campaign:', error)
    
    // Update campaign status to failed
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: { status: 'failed' },
    }).catch(() => {})

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

