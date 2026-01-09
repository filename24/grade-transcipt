import type { BetterAuthPlugin } from 'better-auth'
import { createAuthEndpoint } from 'better-auth/api'
import { z } from 'zod'

import { SCHOOL_ID, STUDENT_GROUP_ID } from '../constants'

const registerNumberSchema = z.object({
  registerNumber: z
    .string()
    .regex(/[А-ЯӨҮа-яөү]{2}[0-9]{8}/, 'Регистрийн дугаарын формат буруу байна.')
    .toLowerCase(),
  password: z.string().optional()
})

const setPasswordSchema = z
  .object({
    password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword']
  })

const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword']
  })

export const registerNumberAuth = () => {
  return {
    id: 'register-number-auth',
    endpoints: {
      signInRegisterNumber: createAuthEndpoint(
        '/sign-in/register-number',
        {
          method: 'POST',
          body: registerNumberSchema
        },
        async (ctx) => {
          const { registerNumber, password } = ctx.body
          const adapter = ctx.context.adapter

          // Find existing user
          let user = await adapter.findOne<{
            id: string
            name: string
            email: string
            registerNumber: string
            systemId: string
            role: string
            classId: string
            schoolId: string
            currectAcademicLevel: number
            emailVerified: boolean
            createdAt: Date
            updatedAt: Date
          }>({
            model: 'user',
            where: [{ field: 'registerNumber', value: registerNumber }]
          })

          if (!user) {
            // Find grade data to create user
            const gradeData = await adapter.findOne<{
              id: string
              systemId: string
              displayName: string
              registerNumber: string
              classGrade: string
            }>({
              model: 'grade',
              where: [{ field: 'registerNumber', value: registerNumber }]
            })

            if (!gradeData) {
              return ctx.json(
                { error: 'Регистрийн дугаар олдсонгүй.' },
                { status: 401 }
              )
            }

            // Create new user
            user = await adapter.create<{
              id: string
              name: string
              email: string
              registerNumber: string
              systemId: string
              role: string
              classId: string
              schoolId: string
              currectAcademicLevel: number
              emailVerified: boolean
              createdAt: Date
              updatedAt: Date
            }>({
              model: 'user',
              data: {
                name: gradeData.displayName,
                registerNumber: gradeData.registerNumber,
                email: `${gradeData.systemId}@knea.gt`,
                emailVerified: true,
                role: 'STUDENT',
                systemId: gradeData.systemId,
                classId: STUDENT_GROUP_ID,
                schoolId: SCHOOL_ID,
                currectAcademicLevel: Number(
                  gradeData.classGrade.replace(/\D/g, '')
                ),
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
          } else {
            // Check if user has password set
            const credentialAccount = await adapter.findOne<{
              id: string
              password: string | null
            }>({
              model: 'account',
              where: [
                { field: 'userId', value: user.id },
                { field: 'providerId', value: 'credential' }
              ]
            })

            if (credentialAccount?.password) {
              // User has password, must verify
              if (!password) {
                return ctx.json(
                  {
                    error: '비밀번호를 입력해주세요.',
                    requiresPassword: true
                  },
                  { status: 401 }
                )
              }

              const isValid = await ctx.context.password.verify({
                password,
                hash: credentialAccount.password
              })

              if (!isValid) {
                return ctx.json(
                  { error: '비밀번호가 일치하지 않습니다.' },
                  { status: 401 }
                )
              }
            }
          }

          // Create session
          const session = await ctx.context.internalAdapter.createSession(
            user.id
          )

          // Set session cookie
          await ctx.setSignedCookie(
            ctx.context.authCookies.sessionToken.name,
            session.token,
            ctx.context.secret,
            ctx.context.authCookies.sessionToken.options
          )

          return ctx.json({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              registerNumber: user.registerNumber,
              systemId: user.systemId,
              role: user.role,
              classId: user.classId,
              schoolId: user.schoolId,
              currectAcademicLevel: user.currectAcademicLevel
            },
            session: {
              id: session.id,
              token: session.token,
              expiresAt: session.expiresAt
            }
          })
        }
      ),

      // Check if user has password set
      hasPassword: createAuthEndpoint(
        '/has-password',
        {
          method: 'GET',
          requireHeaders: true
        },
        async (ctx) => {
          const sessionToken = await ctx.getSignedCookie(
            ctx.context.authCookies.sessionToken.name,
            ctx.context.secret
          )
          if (!sessionToken) {
            return ctx.json({ error: '로그인이 필요합니다.' }, { status: 401 })
          }

          const sessionData =
            await ctx.context.internalAdapter.findSession(sessionToken)
          if (!sessionData) {
            return ctx.json({ error: '로그인이 필요합니다.' }, { status: 401 })
          }

          const adapter = ctx.context.adapter
          const credentialAccount = (await adapter.findOne({
            model: 'account',
            where: [
              { field: 'userId', value: sessionData.session.userId },
              { field: 'providerId', value: 'credential' }
            ]
          })) as { id: string; password: string | null } | null

          return ctx.json({
            hasPassword: !!credentialAccount?.password
          })
        }
      ),

      // Set password for first time
      setPassword: createAuthEndpoint(
        '/set-password',
        {
          method: 'POST',
          body: setPasswordSchema,
          requireHeaders: true
        },
        async (ctx) => {
          const sessionToken = await ctx.getSignedCookie(
            ctx.context.authCookies.sessionToken.name,
            ctx.context.secret
          )
          if (!sessionToken) {
            return ctx.json({ error: '로그인이 필요합니다.' }, { status: 401 })
          }

          const sessionData =
            await ctx.context.internalAdapter.findSession(sessionToken)
          if (!sessionData) {
            return ctx.json({ error: '로그인이 필요합니다.' }, { status: 401 })
          }

          const { password } = ctx.body
          const adapter = ctx.context.adapter
          const userId = sessionData.session.userId

          // Check if password already exists
          const existingAccount = (await adapter.findOne({
            model: 'account',
            where: [
              { field: 'userId', value: userId },
              { field: 'providerId', value: 'credential' }
            ]
          })) as { id: string; password: string | null } | null

          if (existingAccount?.password) {
            return ctx.json(
              {
                error:
                  '비밀번호가 이미 설정되어 있습니다. 변경하려면 change-password를 사용하세요.'
              },
              { status: 400 }
            )
          }

          // Hash password
          const hashedPassword = await ctx.context.password.hash(password)

          if (existingAccount) {
            // Update existing credential account
            await adapter.update({
              model: 'account',
              where: [{ field: 'id', value: existingAccount.id }],
              update: {
                password: hashedPassword,
                updatedAt: new Date()
              }
            })
          } else {
            // Create new credential account
            await adapter.create({
              model: 'account',
              data: {
                userId: userId,
                accountId: userId,
                providerId: 'credential',
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
          }

          return ctx.json({
            success: true,
            message: '비밀번호가 설정되었습니다.'
          })
        }
      ),

      // Change existing password
      changePassword: createAuthEndpoint(
        '/change-password',
        {
          method: 'POST',
          body: changePasswordSchema,
          requireHeaders: true
        },
        async (ctx) => {
          const sessionToken = await ctx.getSignedCookie(
            ctx.context.authCookies.sessionToken.name,
            ctx.context.secret
          )
          if (!sessionToken) {
            return ctx.json({ error: '로그인이 필요합니다.' }, { status: 401 })
          }

          const sessionData =
            await ctx.context.internalAdapter.findSession(sessionToken)
          if (!sessionData) {
            return ctx.json({ error: '로그인이 필요합니다.' }, { status: 401 })
          }

          const { currentPassword, newPassword } = ctx.body
          const adapter = ctx.context.adapter
          const userId = sessionData.session.userId

          // Find credential account
          const credentialAccount = (await adapter.findOne({
            model: 'account',
            where: [
              { field: 'userId', value: userId },
              { field: 'providerId', value: 'credential' }
            ]
          })) as { id: string; password: string | null } | null

          if (!credentialAccount?.password) {
            return ctx.json(
              {
                error:
                  '비밀번호가 설정되어 있지 않습니다. 먼저 비밀번호를 설정하세요.'
              },
              { status: 400 }
            )
          }

          // Verify current password
          const isValid = await ctx.context.password.verify({
            password: currentPassword,
            hash: credentialAccount.password
          })

          if (!isValid) {
            return ctx.json(
              { error: '현재 비밀번호가 일치하지 않습니다.' },
              { status: 401 }
            )
          }

          // Hash new password
          const hashedPassword = await ctx.context.password.hash(newPassword)

          // Update password
          await adapter.update({
            model: 'account',
            where: [{ field: 'id', value: credentialAccount.id }],
            update: {
              password: hashedPassword,
              updatedAt: new Date()
            }
          })

          return ctx.json({
            success: true,
            message: '비밀번호가 변경되었습니다.'
          })
        }
      )
    }
  } satisfies BetterAuthPlugin
}
