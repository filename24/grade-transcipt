import { S3Client } from '@aws-sdk/client-s3'
import { PrismaPg } from '@prisma/adapter-pg'
import { Redis } from '@upstash/redis'
import { PrismaClient } from '../generated/prisma/client'

const globalForDatabase = global as unknown as {
  prisma: PrismaClient
  redis: Redis
  s3: S3Client
}

const s3 =
  globalForDatabase.s3 ||
  new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    apiVersion: 'v4',
    forcePathStyle: true,
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_USERNAME!,
      secretAccessKey: process.env.S3_PASSWORD!
    }
  })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = globalForDatabase.prisma || new PrismaClient({ adapter })

const redis =
  globalForDatabase.redis || Redis.fromEnv({ enableAutoPipelining: false })

export { redis, s3 }
export default prisma

if (process.env.NODE_ENV !== 'production') globalForDatabase.prisma = prisma
if (process.env.NODE_ENV !== 'production') globalForDatabase.redis = redis
if (process.env.NODE_ENV !== 'production') globalForDatabase.s3 = s3

export * from '@aws-sdk/client-s3'
export * from '../generated/prisma/client'
