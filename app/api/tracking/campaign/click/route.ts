import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Track email click and redirect
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('c')
    const email = searchParams.get('e')
    const url = searchParams.get('u')

    if (!campaignId || !email || !url) {
      // Redirect to home if missing params
      return NextResponse.redirect(new URL('/', request.url))
    }

    const decodedUrl = decodeURIComponent(url)
    const decodedEmail = decodeURIComponent(email)

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Record the click (allow multiple clicks from same user)
    await prisma.campaignClick.create({
      data: {
        campaignId,
        email: decodedEmail,
        url: decodedUrl,
        ipAddress: ipAddress.split(',')[0].trim(),
        userAgent,
      },
    }).catch((error) => {
      // Log error but don't block redirect
      console.error('Error tracking email click:', error)
    })

    // Redirect to the original URL
    return NextResponse.redirect(decodedUrl)
  } catch (error) {
    console.error('Error in email click tracking:', error)
    // Try to redirect anyway
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('u')
    if (url) {
      return NextResponse.redirect(decodeURIComponent(url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }
}

