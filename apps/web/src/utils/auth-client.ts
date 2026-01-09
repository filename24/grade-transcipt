import { passkeyClient } from '@better-auth/passkey/client'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { registerNumberAuthClient } from './auth-plugins/register-number.client'
import type { auth } from './better-auth'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    registerNumberAuthClient(),
    passkeyClient(),
    inferAdditionalFields<typeof auth>()
  ]
})

export type Session = typeof authClient.$Infer.Session
