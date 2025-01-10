import { LoginSchema } from '@/schemas/login'
import NextAuth, { User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import prisma from '@/utils/prisma'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { GradeAuthError } from './error'

export const { handlers, signIn, signOut, auth } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 14 * 24 * 60 * 60, // 14 days
    updateAge: 24 * 60 * 60 // 24 hours
  },
  cookies: {},
  pages: {
    signIn: '/login'
  },
  jwt: {
    maxAge: 14 * 24 * 60 * 60 // 14 days
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role
      return session
    },
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl

      if (pathname.includes('dash')) return !!auth
      return true
    }
  },
  providers: [
    Credentials({
      credentials: {
        registerNumber: {}
      },
      authorize: async (credentials): Promise<User> => {
        let user = null

        const loginData = LoginSchema.safeParse(credentials)

        if (!loginData.success) {
          throw new GradeAuthError('Буруу утга оруулсан байна.')
        }

        const gradeData = await prisma.grade.findFirst({
          where: {
            registerNumber: loginData.data.registerNumber
          }
        })

        if (!gradeData) {
          throw new GradeAuthError('Knea - Grade system бүртгэлгүй байна.')
        }

        user = await prisma.user.findFirst({
          where: {
            registerNumber: loginData.data.registerNumber
          },
          select: {
            id: true,
            name: true,
            registerNumber: true,
            role: true
          }
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: gradeData.displayName,
              registerNumber: gradeData.registerNumber,
              role: 'STUDENT'
            }
          })
        }

        return user
      }
    })
  ]
})
