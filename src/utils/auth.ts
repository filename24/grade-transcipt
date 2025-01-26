import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from './prisma'
import { admin as adminPlugin, username } from 'better-auth/plugins'
import { createAuthClient } from 'better-auth/react'
import { registerNumber } from '@/plugins/registerNumber'
import { registerNumberClient } from '@/plugins/registerNumber/client'
import { adminClient, usernameClient } from 'better-auth/client/plugins'
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
  },
  advanced: {
    cookiePrefix: 'knea.gt'
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache duration in seconds
    }
  },
  plugins: [username(), registerNumber(), adminPlugin()],
  emailAndPassword: {
    enabled: false
  },

  user: {
    additionalFields: {
      systemId: {
        type: 'string',
        required: true
      }
    }
  }
})

export const { signIn, signUp, useSession, signOut, admin } = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [registerNumberClient(), usernameClient(), adminClient()]
})

export async function getSession(headers: ReadonlyHeaders) {
  return await auth.api.getSession({
    headers
  })
}

export type Session = typeof auth.$Infer.Session
