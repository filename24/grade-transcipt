import type { Role } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    id: string
    name: string
    registerNumber: string
    role: Role
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from 'next-auth/jwt'

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
  }
}

declare module 'next-auth' {
  interface Session {
    token: string
  }
}
