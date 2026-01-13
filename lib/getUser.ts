import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from './db'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')
 
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, secret)
    const userId = payload.userId as string

    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
      },
    })

    return user
  } catch (error) {
    return null
  }
}

