import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Track email open (called by tracking pixel)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('c')
    const email = searchParams.get('e')

    if (!campaignId || !email) {
      // Return 1x1 transparent pixel even if tracking fails
      return new NextResponse(
        Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
        {
          headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      )
    }

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check if already tracked (prevent duplicate opens)
    const existingOpen = await prisma.campaignOpen.findFirst({
      where: {
        campaignId,
        email: decodeURIComponent(email),
      },
      orderBy: {
        openedAt: 'desc',
      },
    })

    // Only track if not opened in last 5 minutes (prevent spam)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    if (existingOpen && existingOpen.openedAt > fiveMinutesAgo) {
      // Return pixel anyway
      return new NextResponse(
        Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
        {
          headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      )
    }

    // Record the open
    await prisma.campaignOpen.create({
      data: {
        campaignId,
        email: decodeURIComponent(email),
        ipAddress: ipAddress.split(',')[0].trim(),
        userAgent,
      },
    }).catch((error) => {
      // Silently fail - don't break email rendering
      console.error('Error tracking email open:', error)
    })

    // Return 1x1 transparent pixel
    return new NextResponse(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error) {
    // Always return pixel even on error
    console.error('Error in email open tracking:', error)
    return new NextResponse(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  }
}

