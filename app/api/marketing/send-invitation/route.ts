import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { sendMarketingEmail } from '@/lib/email-templates'
import { z } from 'zod'

const invitationSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(10),
  message: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { emails, message } = invitationSchema.parse(body)

    // Send invitation emails
    const results = await Promise.allSettled(
      emails.map(email =>
        sendMarketingEmail(email, 'invitation', {
          userName: email.split('@')[0],
          inviterName: user.name || user.email,
          customMessage: message,
        })
      )
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: emails.length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error sending invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

