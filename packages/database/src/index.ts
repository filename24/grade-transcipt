// import { PrismaClient } from '../generated/prisma'

import { PrismaClient } from '@prisma/client'

// import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma || new PrismaClient()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// export * from '../generated/prisma'
export * from '@prisma/client'
