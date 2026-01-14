import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserByEmail } from '@/lib/auth'
import { sendEmailNotification } from '@/lib/notifications'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Find user by email
    const user = await getUserByEmail(email.toLowerCase())

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate secure token
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour

      // Delete any existing reset tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          used: false,
        },
      })

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      })

      // Generate reset URL
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://expira.io'}/reset-password?token=${token}`

      // Send password reset email
      await sendEmailNotification(
        user.email,
        'Reset Your Password - expira',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0ea5e9; font-size: 28px; margin: 0;">expira</h1>
          </div>
          
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px;">
            <h2 style="color: #0c4a6e; font-size: 24px; margin-top: 0;">Reset Your Password</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Hello${user.name ? ` ${user.name}` : ''},
            </p>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password for your expira account. Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #0ea5e9; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #0ea5e9; font-size: 14px; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              If you're having trouble clicking the button, copy and paste the URL above into your web browser.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              This is an automated email from expira. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
      )
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error processing forgot password request:', error)
    // Still return success to prevent information leakage
    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.',
    })
  }
}

