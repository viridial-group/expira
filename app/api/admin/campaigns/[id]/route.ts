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
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ campaign })
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

