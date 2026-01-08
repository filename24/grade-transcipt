import { passkey } from '@better-auth/passkey'
import prisma from '@gt/database'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'

import { registerNumberAuth } from './auth-plugins/register-number'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  plugins: [
    registerNumberAuth(),
    passkey({
      rpID: process.env.PASSKEY_RP_ID || 'localhost',
      rpName: 'Grade Transcript',
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }),
    nextCookies()
  ],
  advanced: {
    cookiePrefix: 'knea-gt'
  },
  appName: 'Grade Transcript',
  user: {
    additionalFields: {
      role: { type: 'string' },
      systemId: { type: 'string' },
      avatar: { type: 'string', required: false },
      banner: { type: 'string', required: false },
      currectAcademicLevel: { type: 'number' },
      registerNumber: { type: 'string' },
      classId: { type: 'string', required: false },
      schoolId: { type: 'string', required: false }
    }
  }
})
