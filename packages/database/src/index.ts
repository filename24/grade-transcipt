// import { PrismaClient } from '../generated/prisma'
// import { withAccelerate } from '@prisma/extension-accelerate'

import { PrismaClient } from '@prisma/client'
import { Redis } from '@upstash/redis'
import { S3 } from '@aws-sdk/client-s3'

const globalForDatabase = global as unknown as {
  prisma: PrismaClient
  redis: Redis
  s3: S3
}

const s3 =
  globalForDatabase.s3 ||
  new S3({
    endpoint: process.env.S3_ENDPOINT,
    apiVersion: 'v4',
    forcePathStyle: true,
    credentials: {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      accessKeyId: process.env.S3_USERNAME!,
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      secretAccessKey: process.env.S3_PASSWORD!
    }
  })

const prisma = globalForDatabase.prisma || new PrismaClient()

const redis =
  globalForDatabase.redis || Redis.fromEnv({ enableAutoPipelining: false })

export { redis, s3 }
export default prisma

if (process.env.NODE_ENV !== 'production') globalForDatabase.prisma = prisma
if (process.env.NODE_ENV !== 'production') globalForDatabase.redis = redis
if (process.env.NODE_ENV !== 'production') globalForDatabase.s3 = s3

// export * from '../generated/prisma'
export * from '@prisma/client'
