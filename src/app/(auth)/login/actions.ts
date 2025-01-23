'use server'

import { EsisLoginSchema, RegisterLoginSchema } from '@/schemas/login'
import { signIn } from '@/utils/auth'
import { GradeError } from '@/utils/error'

export async function loginWithRegister(
  _state: RegisterLoginFormState,
  formData: FormData
): Promise<RegisterLoginFormState> {
  const loginData = RegisterLoginSchema.safeParse({
    registerNumber: formData.get('registerNumber')
  })

  if (!loginData.success) {
    return {
      errors: loginData.error.flatten().fieldErrors
    }
  }

  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (GradeError.isAuthError(error)) {
      return {
        message: error.message
      }
    } else {
      throw error
    }
  }
}

export async function loginWithEsis(
  _state: EsisLoginFormState,
  formData: FormData
): Promise<EsisLoginFormState> {
  const loginData = EsisLoginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password')
  })

  if (!loginData.success) {
    return {
      errors: loginData.error.flatten().fieldErrors
    }
  }

  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (GradeError.isAuthError(error)) {
      return {
        message: error.message
      }
    } else {
      throw error
    }
  }
}

export type RegisterLoginFormState =
  | {
      errors?: {
        registerNumber?: string[]
      }
      message?: string
    }
  | undefined

export type EsisLoginFormState =
  | {
      errors?: {
        password?: string[]
      }
      message?: string
    }
  | undefined
