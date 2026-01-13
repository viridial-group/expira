import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { prisma } from '@/lib/db'

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
    const days = parseInt(searchParams.get('days') || '30')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get visitor statistics
    const [
      totalVisitors,
      totalVisits,
      uniqueVisitors,
      recentVisitors,
      topPages,
      visitsByDay,
    ] = await Promise.all([
      prisma.visitor.count(),
      prisma.visit.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),
      prisma.visitor.count({
        where: {
          lastVisit: {
            gte: startDate,
          },
        },
      }),
      prisma.visitor.findMany({
        include: {
          _count: {
            select: {
              visits: true,
            },
          },
          visits: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          lastVisit: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.visit.groupBy({
        by: ['path'],
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      }),
      // Get visits for daily aggregation
      prisma.visit.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          createdAt: true,
        },
        take: 10000, // Limit to avoid memory issues
      }),
    ])

    // Get referrer statistics
    const referrers = await prisma.visitor.groupBy({
      by: ['referrer'],
      where: {
        lastVisit: {
          gte: startDate,
        },
        referrer: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    })

    // Process visits by day
    const visitsByDayMap = new Map<string, number>()
    visitsByDay.forEach((visit: { createdAt: Date }) => {
      const date = visit.createdAt.toISOString().split('T')[0]
      visitsByDayMap.set(date, (visitsByDayMap.get(date) || 0) + 1)
    })
    
    const visitsByDayArray = Array.from(visitsByDayMap.entries())
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30) // Last 30 days

    return NextResponse.json({
      stats: {
        totalVisitors,
        totalVisits,
        uniqueVisitors,
        period: days,
      },
      visitors: recentVisitors.map(v => ({
        id: v.id,
        sessionId: v.sessionId,
        ipAddress: v.ipAddress,
        country: v.country,
        city: v.city,
        firstVisit: v.firstVisit,
        lastVisit: v.lastVisit,
        visitCount: v.visitCount,
        totalPageViews: v._count.visits,
        lastPage: v.visits[0]?.path || null,
      })),
      topPages: topPages.map(p => ({
        path: p.path,
        views: p._count.id,
      })),
      referrers: referrers
        .filter(r => r.referrer)
        .map(r => ({
          referrer: r.referrer,
          count: r._count.id,
        })),
      visitsByDay: visitsByDayArray,
      pagination: {
        page,
        limit,
        total: totalVisitors,
        totalPages: Math.ceil(totalVisitors / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching visitor analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

