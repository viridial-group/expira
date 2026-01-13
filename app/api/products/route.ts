import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/getUser'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  type: z.enum(['website', 'domain', 'ssl', 'api']),
  expiresAt: z.string().optional(),
  customFields: z.object({
    expectedText: z.string().optional(),
    expectedStatusCode: z.number().optional(),
    maxResponseTime: z.number().optional(),
  }).optional(),
})

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const products = await prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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

    const body = await request.json()
    const { name, url, type, expiresAt, customFields } = productSchema.parse(body)

    // Check subscription limits
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
    })

    const productCount = await prisma.product.count({
      where: { userId: user.id },
    })

    // Basic plan: 10 products, Pro: 100, Enterprise: unlimited
    const limits: Record<string, number> = {
      starter: 10,
      professional: 100,
      enterprise: Infinity,
    }

    const planId = subscription?.planId || 'starter'
    const limit = limits[planId] || 10

    if (productCount >= limit) {
      return NextResponse.json(
        { error: `You've reached your plan limit. Please upgrade to add more products.` },
        { status: 403 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        url,
        type,
        userId: user.id,
        status: 'active',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        customFields: customFields && Object.keys(customFields).length > 0 ? customFields : undefined,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

