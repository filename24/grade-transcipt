import { passkey } from '@better-auth/passkey'
import prisma from '@gt/database'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'

import { registerNumberAuth } from './auth-plugins/register-number'

const normalizeOrigin = (val?: string) =>
  val
    ? val.startsWith('http://') || val.startsWith('https://')
      ? val
      : `https://${val}`
    : undefined

const normalizeHost = (val?: string) =>
  val ? val.replace(/^https?:\/\//, '').replace(/\/$/, '') : undefined

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  plugins: [
    registerNumberAuth(),
    passkey({
      rpID:
        process.env.PASSKEY_RP_ID ||
        normalizeHost(process.env.VERCEL_URL) ||
        'localhost',
      rpName: 'Grade Transcript',
      origin:
        process.env.NEXT_PUBLIC_APP_URL ||
        normalizeOrigin(process.env.VERCEL_URL) ||
        'http://localhost:3000'
    }),
    nextCookies()
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Validate password exists before allowing passkey creation
      if (ctx.path === '/passkey/add-passkey') {
        const sessionToken = await ctx.getSignedCookie(
          ctx.context.authCookies.sessionToken.name,
          ctx.context.secret
        )

        if (!sessionToken) {
          throw new APIError('UNAUTHORIZED', {
            message: 'Нэвтрэх шаардлагатай.'
          })
        }

        const sessionData =
          await ctx.context.internalAdapter.findSession(sessionToken)
        if (!sessionData) {
          throw new APIError('UNAUTHORIZED', {
            message: 'Нэвтрэх шаардлагатай.'
          })
        }

        // Check if user has a credential account with password
        const credentialAccount = await ctx.context.adapter.findOne({
          model: 'account',
          where: [
            { field: 'userId', value: sessionData.session.userId },
            { field: 'providerId', value: 'credential' }
          ]
        })

        const hasPassword = !!(
          credentialAccount as { password?: string | null }
        )?.password

        if (!hasPassword) {
          throw new APIError('BAD_REQUEST', {
            message: 'Passkey нэмэхийн өмнө нууц үг тохируулах шаардлагатай.'
          })
        }
      }
    })
  },
  advanced: {
    cookiePrefix: 'knea-gt',
    disableOriginCheck: process.env.NODE_ENV === 'development'
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
      classId: { type: 'string' },
      schoolId: { type: 'string' }
    }
  }
})
