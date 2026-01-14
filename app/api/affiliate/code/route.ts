import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { getOrCreateAffiliateCode, validateAffiliateCode } from '@/lib/affiliate'

// GET - Get user's affiliate code
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const code = await getOrCreateAffiliateCode(user.id, user.email)

    return NextResponse.json({ code })
  } catch (error) {
    console.error('Error fetching affiliate code:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST - Validate affiliate code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Code requis' },
        { status: 400 }
      )
    }

    const validation = await validateAffiliateCode(code)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message || 'Code invalide' },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true, userId: validation.userId })
  } catch (error) {
    console.error('Error validating affiliate code:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

