import type { Role } from '@gt/database'

declare module 'next-auth' {
  interface User {
    id: string
    name: string | null
    role: Role
    systemId: string
    avatar: string | null
    banner: string | null
    currectAcademicLevel: number
  }
}

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
