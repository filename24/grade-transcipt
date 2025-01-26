import { Account, setSessionCookie, type BetterAuthPlugin } from 'better-auth'
import { APIError } from 'better-call'
import z from 'zod'
import { createAuthEndpoint } from 'better-auth/plugins'
import { Prisma, User } from '@prisma/client'
import prisma from '@/utils/prisma'

export const registerNumber = () => {
  const ERROR_CODES = {
    INVALID_REGISTER_NUMBER: 'invalid username or password',
    UNEXPECTED_ERROR: 'unexpected error',
    USERNAME_IS_ALREADY_TAKEN: 'username is already taken. please try another.'
  }

  return {
    id: 'registerNumber',
    endpoints: {
      signInRegisterNumber: createAuthEndpoint(
        '/sign-in/registernumber',
        {
          method: 'POST',
          body: z.object({
            registerNumber: z
              .string()
              .regex(
                /[А-ЯӨҮа-яөү]{2}[0-9]{8}/,
                'Регистрийн дугаарын формат буруу байна.'
              )
              .toLowerCase(),
            rememberMe: z
              .boolean({
                description: 'Remember the user session'
              })
              .optional()
          }),
          metadata: {
            openapi: {
              summary: 'Sign in with register number',
              description: 'Sign in with register number',
              responses: {
                200: {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          user: {
                            $ref: '#/components/schemas/User'
                          },
                          session: {
                            $ref: '#/components/schemas/Session'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        async (ctx) => {
          const grade = await prisma.grade.findFirst({
            where: {
              registerNumber: ctx.body.registerNumber.toLowerCase()
            }
          })

          if (!grade) {
            ctx.context.logger.error('Register number not found', {
              registerNumber: ctx.body.registerNumber
            })
            throw new APIError('UNAUTHORIZED', {
              message: ERROR_CODES.INVALID_REGISTER_NUMBER
            })
          }

          let user = await ctx.context.adapter.findOne<User>({
            model: 'user',
            where: [
              {
                field: 'registerNumber',
                value: ctx.body.registerNumber.toLowerCase()
              }
            ]
          })
          if (!user) {
            user = await ctx.context.adapter.create<
              Prisma.UserCreateInput,
              User
            >({
              model: 'user',
              data: {
                systemId: grade.systemId,
                registerNumber: grade.registerNumber,
                role: 'STUDENT',
                name: grade.displayName
              }
            })
          }

          let account = await ctx.context.adapter.findOne<Account>({
            model: 'account',
            where: [
              {
                field: 'userId',
                value: user.id
              },
              {
                field: 'providerId',
                value: 'credential'
              }
            ]
          })
          if (!account) {
            account = await ctx.context.internalAdapter.linkAccount({
              userId: user.id,
              accountId: user.id,
              providerId: 'credential'
            })
          }

          const session = await ctx.context.internalAdapter.createSession(
            user.id,
            ctx.request,
            ctx.body.rememberMe === false
          )
          if (!session) {
            return ctx.json(null, {
              status: 500,
              body: {
                message: 'Failed to create session ',
                status: 500
              }
            })
          }
          await setSessionCookie(
            ctx,
            // @ts-ignore
            { session, user },
            ctx.body.rememberMe === false
          )
          return ctx.json({
            token: session.token,
            user: {
              id: user.id,
              registerNumber: user.registerNumber,
              name: user.name,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            }
          })
        }
      )
    },
    schema: {
      user: {
        fields: {
          registerNumber: {
            type: 'string',
            required: true,
            unique: false
          },
          systemId: {
            type: 'string',
            required: true,
            unique: false
          }
        }
      }
    },
    hooks: {
      before: [
        {
          matcher(context) {
            return context.path === '/sign-up/email'
          },
          async handler(ctx) {
            const registerNumber = ctx.body.registerNumber
            if (registerNumber) {
              const user = await ctx.context.adapter.findOne<User>({
                model: 'user',
                where: [
                  {
                    field: 'registerNumber',
                    value: registerNumber.toLowerCase()
                  }
                ]
              })
              if (user) {
                throw new APIError('UNPROCESSABLE_ENTITY', {
                  message: ERROR_CODES.USERNAME_IS_ALREADY_TAKEN
                })
              }
            }
          }
        }
      ]
    }
  } satisfies BetterAuthPlugin
}
