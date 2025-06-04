import type { Role } from '@gt/database'

declare module 'next-auth' {
  interface User {
    id: string
    name: string | null
    registerNumber: string
    role: Role
    systemId: string
  }
}

import { JWT } from 'next-auth/jwt'

declare module 'next-auth/jwt' {
  interface JWT {
    user: User
  }
}

declare module 'next-auth' {
  interface Session {
    token: string
  }
}
