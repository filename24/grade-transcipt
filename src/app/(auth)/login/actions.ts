'use server'

import { LoginSchema } from '@/schemas/login'
import { signIn } from '@/utils/auth'
import { GradeError } from '@/utils/error'

export async function login(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const loginData = LoginSchema.safeParse({
    registerNumber: formData.get('registerNumber'),
  })

  if (!loginData.success) {
    return {
      errors: loginData.error.flatten().fieldErrors,
    }
  }

  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (GradeError.isAuthError(error)) {
      return {
        message: error.message,
      }
    } else {
      throw error
    }
  }
}

export type LoginFormState =
  | {
      errors?: {
        registerNumber?: string[]
      }
      message?: string
    }
  | undefined
