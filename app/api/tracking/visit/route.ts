import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

// Generate or get session ID
async function getSessionId(request: NextRequest): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get('visitor_session')?.value

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  return sessionId
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, referrer, duration } = body

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      )
    }

    // Get or create session ID
    const sessionId = await getSessionId(request)
    
    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referrerHeader = referrer || request.headers.get('referer') || null

    // Find or create visitor
    let visitor = await prisma.visitor.findUnique({
      where: { sessionId },
    })

    if (!visitor) {
      visitor = await prisma.visitor.create({
        data: {
          sessionId,
          ipAddress: ipAddress.split(',')[0].trim(), // Get first IP if multiple
          userAgent,
          referrer: referrerHeader,
          firstVisit: new Date(),
          lastVisit: new Date(),
          visitCount: 1,
        },
      })
    } else {
      // Update visitor stats
      await prisma.visitor.update({
        where: { id: visitor.id },
        data: {
          lastVisit: new Date(),
          visitCount: visitor.visitCount + 1,
          referrer: referrerHeader || visitor.referrer,
        },
      })
    }

    // Create visit record
    await prisma.visit.create({
      data: {
        visitorId: visitor.id,
        path,
        referrer: referrerHeader,
        duration: duration || null,
      },
    })

    // Set session cookie (30 days)
    const response = NextResponse.json({ success: true, sessionId })
    response.cookies.set('visitor_session', sessionId, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch (error) {
    console.error('Error tracking visit:', error)
    // Don't fail the request if tracking fails
    return NextResponse.json({ success: false }, { status: 200 })
  }
}

// GET - Get visitor stats (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [totalVisitors, totalVisits, uniqueVisitors, pageViews] = await Promise.all([
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
    ])

    return NextResponse.json({
      totalVisitors,
      totalVisits,
      uniqueVisitors,
      pageViews: pageViews.map(pv => ({
        path: pv.path,
        count: pv._count.id,
      })),
      period: days,
    })
  } catch (error) {
    console.error('Error fetching visitor stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

