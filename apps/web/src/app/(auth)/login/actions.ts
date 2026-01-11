'use server'

import * as Sentry from '@sentry/nextjs'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { RegisterLoginSchema } from '@/schemas/login'
import { auth } from '@/utils/better-auth'
import '@gt/database'

export async function loginWithRegister(
  _state: RegisterLoginFormState,
  formData: FormData
): Promise<RegisterLoginFormState> {
  const loginData = RegisterLoginSchema.safeParse({
    registerNumber: formData.get('registerNumber'),
    password: formData.get('password') || undefined
  })

  if (!loginData.success) {
    return {
      errors: loginData.error.flatten().fieldErrors
    }
  }

  try {
    const result = await auth.api.signInRegisterNumber({
      body: {
        registerNumber: loginData.data.registerNumber,
        password: loginData.data.password
      },
      headers: await headers()
    })

    // Check if password is required
    if (result && 'requiresPassword' in result && result.requiresPassword) {
      return {
        requiresPassword: true,
        registerNumber: loginData.data.registerNumber,
        message: 'Нууц үгээ оруулна уу.'
      }
    }

    if (!result || ('error' in result && result.error)) {
      const errorMessage =
        result && 'error' in result ? result.error : 'Нэвтрэхэд алдаа гарлаа.'
      return {
        message: errorMessage as string
      }
    }
  } catch (error: unknown) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { feature: 'auth-login' },
      extra: { registerNumber: loginData.data.registerNumber }
    })
    return {
      message: 'Нэвтрэхэд алдаа гарлаа.'
    }
  }

  redirect('/dash')
}

export type RegisterLoginFormState =
  | {
      errors?: {
        registerNumber?: string[]
        password?: string[]
      }
      message?: string
      requiresPassword?: boolean
      registerNumber?: string
    }
  | undefined
