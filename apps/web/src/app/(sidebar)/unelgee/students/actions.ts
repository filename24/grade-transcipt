'use server'

import { parseTextToArray } from '@/utils'
import { getUnelgeeStudents } from '@/utils/fetch'
import '@gt/database'
import prisma from '@gt/database'
import { z } from 'zod'

export async function getUnelgeeData(
  state: GetUnelgeeDataFormState,
  formData: FormData
): Promise<GetUnelgeeDataFormState> {
  const schemas = UnelgeeFetchSchema.safeParse({
    registerNumbers: formData.get('registerNumbers'),
    className: formData.get('className')
  })

  if (!schemas.success) {
    return {
      errors: schemas.error.flatten().fieldErrors
    }
  }

  let registerNumbers = parseTextToArray(schemas.data.registerNumbers)

  const className = schemas.data.className

  const existingRecords = (
    await prisma.unelgeeSubjects.findMany({
      where: {
        class: className,
        registerNumber: {
          in: registerNumbers
        }
      },
      select: {
        registerNumber: true
      }
    })
  ).map((record) => record.registerNumber)

  registerNumbers = registerNumbers.filter(
    (num) => !existingRecords.includes(num)
  )

  if (registerNumbers.length === 0)
    return {
      errors: {
        message: `${className} ангид бүх суралцагчийн мэдээлэл татагдсан байна.`
      }
    }

  const data = await getUnelgeeStudents(registerNumbers, className)

  return {
    message: `Амжилттай ${registerNumbers.length} сурагчаас ${data.count} мэдээлэл татан авлаа.`
  }
}

export type GetUnelgeeDataFormState =
  | {
      errors?: {
        className?: string[]
        message?: string
      }
      message?: string
    }
  | undefined

const UnelgeeFetchSchema = z.object({
  registerNumbers: z.string(),
  className: z.string()
})
