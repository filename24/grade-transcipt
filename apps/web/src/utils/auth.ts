import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@gt/database'
import * as Sentry from '@sentry/nextjs'
import { SignJWT } from 'jose'
import NextAuth, { type User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { SCHOOL_ID, STUDENT_GROUP_ID } from './constants'
import { GradeAuthError } from './error'

import { RegisterLoginSchema } from '@/schemas/login'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development',
  events: {
    signOut(message) {
      if ('session' in message && message.session) {
        console.log('sign out: ', message.session.userId)
      } else if ('token' in message && message.token) {
        console.log('sign out: ', message.token.name)
      }
    }
  },
  cookies: {
    csrfToken: { name: 'knea.gt.csrf' },
    sessionToken: { name: 'knea.gt.session' },
    callbackUrl: { name: 'knea.gt.callback' },
    nonce: { name: 'knea.gt.nonce' },
    state: { name: 'knea.gt.state' },
    pkceCodeVerifier: { name: 'knea.gt.pkce' }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 14 * 60 * 24 * 7
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    async session({ session, token }) {
      session.user = token.user as typeof session.user

      const scope = Sentry.getCurrentScope()

      scope.setUser({
        username: token.name || 'Unknown User'
      })

      const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
      const jwt = await new SignJWT(token)
        .setProtectedHeader({ alg: 'HS512' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(secret)

      session.token = jwt
      return session
    },
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl

      if (pathname.includes('dash')) return !!auth

      if (pathname.includes('profile')) return !!auth

      return true
    }
  },
  providers: [
    Credentials({
      credentials: {
        registerNumber: {},
        username: {},
        password: {}
      },
      authorize: async (credentials): Promise<User | null> => {
        let user = null

        if (credentials.registerNumber) {
          const loginData = RegisterLoginSchema.safeParse(credentials)

          if (!loginData.success) {
            throw new GradeAuthError('Буруу утга оруулсан байна.')
          }

          user = await prisma.user.findFirst({
            where: {
              registerNumber: loginData.data.registerNumber
            },
            select: {
              id: true,
              name: true,
              role: true,
              systemId: true,
              avatar: true,
              banner: true,
              currectAcademicLevel: true
            }
          })

          if (!user) {
            const gradeData = await prisma.grade.findFirst({
              where: {
                registerNumber: loginData.data.registerNumber
              }
            })

            if (!gradeData) {
              throw new GradeAuthError('Knea - Grade system бүртгэлгүй байна.')
            }

            user = await prisma.user.create({
              data: {
                name: gradeData.displayName,
                registerNumber: gradeData.registerNumber,
                role: 'STUDENT',
                systemId: gradeData.systemId,
                classId: STUDENT_GROUP_ID,
                schoolId: SCHOOL_ID,
                currectAcademicLevel: Number(
                  gradeData.classGrade.replace(/\D/g, '')
                )
              },
              select: {
                id: true,
                name: true,
                role: true,
                systemId: true,
                avatar: true,
                banner: true,
                currectAcademicLevel: true
              }
            })
          }
        }
        console.log(user?.name, user?.id)
        return user
      }
    })
  ]
})
