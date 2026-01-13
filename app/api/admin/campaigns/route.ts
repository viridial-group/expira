import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { prisma } from '@/lib/db'

// GET - List all campaigns
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.emailCampaign.count({ where }),
    ])

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new campaign
export async function POST(request: NextRequest) {
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
    } = body

    if (!subject || !content || !recipientType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate total recipients
    let totalRecipients = 0
    if (recipientType === 'custom' && recipientEmails) {
      totalRecipients = Array.isArray(recipientEmails) ? recipientEmails.length : 0
    } else {
      // Count users based on recipient type
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
      // "all" means all users, no filter needed
      
      totalRecipients = await prisma.user.count({ where })
    }

    const campaign = await prisma.emailCampaign.create({
      data: {
        createdBy: user.id,
        subject,
        content,
        recipientType,
        recipientEmails: recipientEmails ? JSON.parse(JSON.stringify(recipientEmails)) : null,
        status: scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
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

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

