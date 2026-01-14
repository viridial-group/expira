import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/auth'
import { createReferral, validateAffiliateCode } from '@/lib/affiliate'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  affiliateCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, affiliateCode } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Validate affiliate code if provided
    let isValidAffiliateCode = false
    if (affiliateCode && affiliateCode.trim()) {
      const validation = await validateAffiliateCode(affiliateCode)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.message || 'Code d\'affiliation invalide' },
          { status: 400 }
        )
      }
      isValidAffiliateCode = true
    }

    // Create user with affiliate code reference
    const user = await createUser(email, password, name, affiliateCode || null)

    // Create referral if affiliate code is valid
    if (isValidAffiliateCode && affiliateCode) {
      try {
        await createReferral(user.id, affiliateCode)
      } catch (referralError) {
        // Log error but don't fail registration
        console.error('Error creating referral:', referralError)
      }
    }

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

