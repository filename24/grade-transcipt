import type { BetterAuthClientPlugin } from 'better-auth/client'

import type { registerNumberAuth } from './register-number'

export const registerNumberAuthClient = () => {
  return {
    id: 'register-number-auth',
    $InferServerPlugin: {} as ReturnType<typeof registerNumberAuth>,
    getActions: ($fetch) => ({
      signInRegisterNumber: async (data: {
        registerNumber: string
        password?: string
      }) => {
        const response = await $fetch<
          | {
              user: {
                id: string
                name: string
                email: string
                registerNumber: string
                systemId: string
                role: string
                classId: string
                schoolId: string
                currectAcademicLevel: number
              }
              session: {
                id: string
                token: string
                expiresAt: Date
              }
            }
          | { error: string; requiresPassword?: boolean }
        >('/sign-in/register-number', {
          method: 'POST',
          body: data
        })
        return response
      },
      hasPassword: async () => {
        const response = await $fetch<
          { hasPassword: boolean } | { error: string }
        >('/has-password', { method: 'GET' })
        return response
      },
      setPassword: async (data: {
        password: string
        confirmPassword: string
      }) => {
        const response = await $fetch<
          { success: boolean; message: string } | { error: string }
        >('/set-password', {
          method: 'POST',
          body: data
        })
        return response
      },
      changePassword: async (data: {
        currentPassword: string
        newPassword: string
        confirmPassword: string
      }) => {
        const response = await $fetch<
          { success: boolean; message: string } | { error: string }
        >('/change-password', {
          method: 'POST',
          body: data
        })
        return response
      }
    })
  } satisfies BetterAuthClientPlugin
}
