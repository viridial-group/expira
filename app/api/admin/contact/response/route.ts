import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { sendEmailNotification } from '@/lib/notifications'

const responseSchema = z.object({
  contactMessageId: z.string(),
  message: z.string().min(1, 'Message is required'),
})

// Check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  return user?.role === 'admin'
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { contactMessageId, message } = responseSchema.parse(body)

    // Get the contact message
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id: contactMessageId },
    })

    if (!contactMessage) {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      )
    }

    // Create response
    const response = await prisma.contactResponse.create({
      data: {
        contactMessageId,
        userId: user.id,
        message,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Update contact message status
    await prisma.contactMessage.update({
      where: { id: contactMessageId },
      data: { status: 'replied' },
    })

    // Send email to the contact
    await sendEmailNotification(
      contactMessage.email,
      `Re: ${contactMessage.subject}`,
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Response to your message</h2>
        <p>Hello ${contactMessage.name},</p>
        <p>Thank you for contacting us. Here is our response:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          <strong>Your original message:</strong><br>
          ${contactMessage.message.replace(/\n/g, '<br>')}
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Best regards,<br>
          The expira Team
        </p>
      </div>
    `
    )

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating response:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

