import { checkProductExpiration } from '../lib/notifications'
import { prisma } from '../lib/db'

async function main() {
  console.log('Starting expiration check...')
  try {
    await checkProductExpiration()
    console.log('Expiration check completed')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})

