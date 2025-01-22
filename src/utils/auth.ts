import { LoginSchema } from '@/schemas/login'
import NextAuth, { type User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import prisma from '@/utils/prisma'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { GradeAuthError } from './error'
import { SignJWT } from 'jose'

export const { handlers, signIn, signOut, auth } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development',
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
      if (user) token.role = user.role
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role

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
            role: true,
            systemId: true
          }
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: gradeData.displayName,
              registerNumber: gradeData.registerNumber,
              role: 'STUDENT',
              systemId: gradeData.systemId
            }
          })
        }

        return user
      }
    })
  ]
})
