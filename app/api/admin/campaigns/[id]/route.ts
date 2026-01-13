import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { prisma } from '@/lib/db'

// GET - Get campaign details
export async function GET(
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
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            opens: true,
            clicks: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Parse recipientEmails if it's a JSON array
    let parsedRecipientEmails: string[] | null = null
    if (campaign.recipientEmails) {
      try {
        if (Array.isArray(campaign.recipientEmails)) {
          parsedRecipientEmails = campaign.recipientEmails as string[]
        } else if (typeof campaign.recipientEmails === 'string') {
          const parsed = JSON.parse(campaign.recipientEmails)
          parsedRecipientEmails = Array.isArray(parsed) ? parsed : null
        } else {
          // Handle Prisma Json type
          const asAny = campaign.recipientEmails as any
          parsedRecipientEmails = Array.isArray(asAny) ? asAny : null
        }
      } catch (error) {
        console.error('Error parsing recipientEmails:', error)
        parsedRecipientEmails = null
      }
    }

    // Get unique opens and clicks counts
    const [uniqueOpens, uniqueClicks] = await Promise.all([
      prisma.campaignOpen.groupBy({
        by: ['email'],
        where: { campaignId: params.id },
      }),
      prisma.campaignClick.groupBy({
        by: ['email'],
        where: { campaignId: params.id },
      }),
    ])

    const parsedCampaign = {
      ...campaign,
      recipientEmails: parsedRecipientEmails,
      tracking: {
        totalOpens: campaign._count.opens,
        uniqueOpens: uniqueOpens.length,
        totalClicks: campaign._count.clicks,
        uniqueClicks: uniqueClicks.length,
        openRate: campaign.totalRecipients > 0 
          ? Math.round((uniqueOpens.length / campaign.totalRecipients) * 100) 
          : 0,
        clickRate: campaign.totalRecipients > 0
          ? Math.round((uniqueClicks.length / campaign.totalRecipients) * 100)
          : 0,
      },
    }

    return NextResponse.json({ campaign: parsedCampaign })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update campaign
export async function PUT(
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

    const body = await request.json()
    const {
      subject,
      content,
      recipientType,
      recipientEmails,
      scheduledAt,
      status,
    } = body

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Don't allow editing sent campaigns
    if (campaign.status === 'sent' || campaign.status === 'sending') {
      return NextResponse.json(
        { error: 'Cannot edit sent or sending campaigns' },
        { status: 400 }
      )
    }

    // Recalculate total recipients if recipientType changed
    let totalRecipients = campaign.totalRecipients
    if (recipientType && recipientType !== campaign.recipientType) {
      if (recipientType === 'custom' && recipientEmails) {
        totalRecipients = Array.isArray(recipientEmails) ? recipientEmails.length : 0
      } else {
        const where: any = {}
        if (recipientType === 'active') {
          where.subscriptions = {
            some: {
              status: 'active',
            },
          }
        } else if (recipientType === 'trialing') {
          where.subscriptions = {
            some: {
              status: 'trialing',
            },
          }
        } else if (recipientType === 'canceled') {
          where.subscriptions = {
            some: {
              status: 'canceled',
            },
          }
        }
        totalRecipients = await prisma.user.count({ where })
      }
    }

    const updatedCampaign = await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        subject: subject || campaign.subject,
        content: content || campaign.content,
        recipientType: recipientType || campaign.recipientType,
        recipientEmails: recipientEmails
          ? JSON.parse(JSON.stringify(recipientEmails))
          : campaign.recipientEmails,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : campaign.scheduledAt,
        status: status || campaign.status,
        totalRecipients,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ campaign: updatedCampaign })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete campaign
export async function DELETE(
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

    // Don't allow deleting sent or sending campaigns
    if (campaign.status === 'sent' || campaign.status === 'sending') {
      return NextResponse.json(
        { error: 'Cannot delete sent or sending campaigns' },
        { status: 400 }
      )
    }

    await prisma.emailCampaign.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

