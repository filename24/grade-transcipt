// import { PrismaClient } from '../generated/prisma'
// import { withAccelerate } from '@prisma/extension-accelerate'

import { PrismaClient } from '@prisma/client'
import { Redis } from '@upstash/redis'

const globalForDatabase = global as unknown as {
  prisma: PrismaClient
  redis: Redis
}

const prisma = globalForDatabase.prisma || new PrismaClient()

const redis =
  globalForDatabase.redis || Redis.fromEnv({ enableAutoPipelining: false })

export { redis }
export default prisma

if (process.env.NODE_ENV !== 'production') globalForDatabase.prisma = prisma

// export * from '../generated/prisma'
export * from '@prisma/client'
