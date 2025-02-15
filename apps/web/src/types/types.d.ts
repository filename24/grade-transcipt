import type { Role } from '@gt/database'

declare module 'next-auth' {
  interface User {
    name: string
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
