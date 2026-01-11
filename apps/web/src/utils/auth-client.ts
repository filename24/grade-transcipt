import { passkeyClient } from '@better-auth/passkey/client'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { ac, ADMIN, STUDENT, TEACHER } from './auth-permissions'
import { registerNumberAuthClient } from './auth-plugins/register-number.client'
import type { auth } from './better-auth'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    registerNumberAuthClient(),
    passkeyClient(),
    adminClient({
      ac,
      roles: {
        ADMIN,
        TEACHER,
        STUDENT
      }
    }),
    inferAdditionalFields<typeof auth>()
  ]
})

export type Session = typeof authClient.$Infer.Session
