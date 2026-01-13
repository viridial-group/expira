import { NextResponse } from 'next/server'
import { checkProductExpiration } from '@/lib/notifications'

// This endpoint can be called by a cron job service (e.g., Vercel Cron, GitHub Actions, etc.)
export async function GET(request: Request) {
  // Optional: Add authentication header check for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    await checkProductExpiration()
    return NextResponse.json({ success: true, message: 'Expiration check completed' })
  } catch (error) {
    console.error('Error checking expirations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

