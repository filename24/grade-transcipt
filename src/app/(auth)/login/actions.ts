'use server'
import { signIn } from '@/utils/auth'
import { GradeError } from '@/utils/error'
import { redirect } from 'next/navigation'

export async function login(
  _state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const registerNumber = formData.get('registerNumber')?.toString()

  if (!registerNumber)
    return {
      errors: {
        registerNumber: ['Регистерын дугаар хоосон байна.']
      }
    }

  try {
    await signIn.registernumber(
      {
        registerNumber
      },
      {
        onSuccess() {
          redirect('/dash')
        }
      }
    )
  } catch (error) {
    if (GradeError.isAuthError(error)) {
      return {
        message: error.body.message
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
