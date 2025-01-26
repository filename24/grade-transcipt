import type { User as PrismaUser } from '@prisma/client'

declare module 'better-auth/auth' {
  type User = PrismaUser
}
