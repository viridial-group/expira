import nodemailer from 'nodemailer'
import { prisma } from './db'
import { sendSMSNotification } from './sms'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '',
  },
})

export async function sendEmailNotification(
  to: string,
  subject: string,
  html: string
) {
  try {
    const fromName = process.env.FROM_NAME || 'expira'
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@expira.io'
    const from = `${fromName} <${fromEmail}>`

    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

export async function createNotification(
  userId: string,
  type: 'email' | 'sms' | 'push' | 'in_app',
  title: string,
  message: string
) {
  // Create in-app notification
  await prisma.notification.create({
    data: {
      userId,
      type: 'in_app',
      title,
      message,
    },
  })

  // Get user to check preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) return

  // Send email notification
  if (type === 'email' && user.email) {
    await sendEmailNotification(
      user.email,
      title,
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">${title}</h2>
        <p>${message}</p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          This is an automated notification from expira.
        </div>
    `
    )
  }

  // Send SMS notification (check plan limits)
  if (type === 'sms' && user.phone && user.phoneVerified) {
    const { canSendSMS, recordSMSSent } = await import('./sms-limits')
    const smsCheck = await canSendSMS(userId)
    
    if (smsCheck.allowed) {
      const smsMessage = `${title}: ${message}`
      const sent = await sendSMSNotification(user.phone, smsMessage)
      
      if (sent) {
        await recordSMSSent(userId)
      }
    } else {
      // Log that SMS was blocked due to plan limits
      console.log(`SMS blocked for user ${userId}: ${smsCheck.reason}`)
      
      // Optionally send email notification instead
      if (user.email) {
        await sendEmailNotification(
          user.email,
          `${title} (SMS unavailable)`,
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ea5e9;">${title}</h2>
            <p>${message}</p>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e;">
                <strong>Note:</strong> SMS notification unavailable. ${smsCheck.reason}
              </p>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This is an automated notification from expira.
            </p>
          </div>
        `
        )
      }
    }
  }

  // Send push notification
  if (type === 'push' || type === 'in_app') {
    try {
      const { sendPushNotification } = await import('./push-notifications')
      await sendPushNotification(userId, {
        title,
        message,
        url: '/dashboard/notifications',
        tag: `notification-${Date.now()}`,
      })
    } catch (error) {
      console.error('Error sending push notification:', error)
      // Don't fail the entire notification if push fails
    }
  }
}

export async function checkProductExpiration() {
  const products = await prisma.product.findMany({
    where: {
      status: { in: ['active', 'warning'] },
      expiresAt: { not: null },
    },
    include: {
      user: true,
    },
  })

  const now = new Date()
  const warningDays = 30 // Warn 30 days before expiration

  for (const product of products) {
    if (!product.expiresAt) continue

    const expiresAt = new Date(product.expiresAt)
    const daysUntilExpiry = Math.floor(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    let newStatus = product.status
    let shouldNotify = false
    let notificationTitle = ''
    let notificationMessage = ''

    if (daysUntilExpiry < 0) {
      // Expired
      newStatus = 'expired'
      shouldNotify = true
      notificationTitle = 'Product Expired'
      notificationMessage = `Your product "${product.name}" has expired. Please renew it immediately.`
    } else if (daysUntilExpiry <= warningDays && product.status === 'active') {
      // Warning
      newStatus = 'warning'
      shouldNotify = true
      notificationTitle = 'Product Expiring Soon'
      notificationMessage = `Your product "${product.name}" will expire in ${daysUntilExpiry} days.`
    }

    if (newStatus !== product.status) {
      await prisma.product.update({
        where: { id: product.id },
        data: { status: newStatus },
      })
    }

    if (shouldNotify) {
      // Send email notification
      await createNotification(
        product.userId,
        'email',
        notificationTitle,
        notificationMessage
      )

      // Send SMS notification for critical expirations (expired or expiring within 7 days)
      if (daysUntilExpiry < 0 || daysUntilExpiry <= 7) {
        await createNotification(
          product.userId,
          'sms',
          notificationTitle,
          notificationMessage
        )
      }
    }
  }
}

