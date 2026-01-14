import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const status = searchParams.get('status') || 'all'

    const where: any = {}
    if (status !== 'all') {
      where.status = status
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { subscribedAt: 'desc' },
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Email', 'Name', 'Source', 'Status', 'Subscribed At', 'Unsubscribed At']
      const rows = subscribers.map(sub => [
        sub.email,
        sub.name || '',
        sub.source || '',
        sub.status,
        sub.subscribedAt.toISOString(),
        sub.unsubscribedAt?.toISOString() || '',
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // JSON format
    return NextResponse.json({
      subscribers,
      exportedAt: new Date().toISOString(),
      total: subscribers.length,
    })
  } catch (error) {
    console.error('Error exporting newsletter subscribers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

