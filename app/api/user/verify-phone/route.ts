import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { prisma } from '@/lib/db'
import { isValidPhoneNumber, formatPhoneNumber } from '@/lib/sms'
import { sendSMSNotification } from '@/lib/sms'

// Generate verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Request phone verification
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Validate phone number format
    const formattedPhone = formatPhoneNumber(phone)
    if (!isValidPhoneNumber(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please use E.164 format (e.g., +1234567890)' },
        { status: 400 }
      )
    }

    // Generate verification code
    const code = generateVerificationCode()

    // Set expiration to 10 minutes from now
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    // Delete any existing verification codes for this user
    await prisma.phoneVerification.deleteMany({
      where: { userId: user.id },
    })

    // Create new verification record
    await prisma.phoneVerification.create({
      data: {
        userId: user.id,
        phone: formattedPhone,
        code,
        expiresAt,
      },
    })

    // Update user's phone (but not verified yet)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phone: formattedPhone,
        phoneVerified: false, // Reset verification status
      },
    })

    // Send verification SMS
    const smsMessage = `Your expira verification code is: ${code}. This code will expire in 10 minutes.`
    const sent = await sendSMSNotification(formattedPhone, smsMessage)

    if (!sent) {
      // Clean up verification record if SMS failed
      await prisma.phoneVerification.deleteMany({
        where: { userId: user.id },
      })
      return NextResponse.json(
        { error: 'Failed to send verification SMS. Please check your SMS configuration.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your phone',
    })
  } catch (error) {
    console.error('Error requesting phone verification:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}

// Verify phone with code
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 })
    }

    // Find verification record
    const verification = await prisma.phoneVerification.findFirst({
      where: {
        userId: user.id,
        code,
        expiresAt: { gt: new Date() }, // Not expired
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Mark verification as used
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    })

    // Update user's phone as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phone: verification.phone,
        phoneVerified: true,
      },
    })

    // Clean up old verification records
    await prisma.phoneVerification.deleteMany({
      where: {
        userId: user.id,
        verified: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
    })
  } catch (error) {
    console.error('Error verifying phone:', error)
    return NextResponse.json(
      { error: 'Failed to verify phone number' },
      { status: 500 }
    )
  }
}

