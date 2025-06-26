'use server'

import '@gt/database'
import prisma, { type Grade } from '@gt/database'
import type { GradeData } from './_Components/Gradetable'
import { ACADEMIC_YEAR, CURRECT_SEMESTER } from '@/utils/constants'
import { SnowflakeId } from '@/utils'

export async function createGrades(
  state: GetUnelgeeDataFormState,
  gradeData: GradeData[]
): Promise<GetUnelgeeDataFormState> {
  const reslovedData: Omit<Grade, 'id'>[] = []

  const users = await prisma.user.findMany()
  for (let index = 0; index < gradeData.length; index++) {
    const item = gradeData[index]
    const user = users.find(
      (user) =>
        user.registerNumber === item.registerNumber &&
        user.name === item.displayName
    )

    if (!item.point) {
      continue
    }
    if (item.point === 0) {
      continue
    }
    if (!user) {
      return {
        errors: {
          message: `Сурагчын мэдээлэл олдсонгүй. Регистрын дугаар: ${item.registerNumber}, Нэр: ${item.displayName}`
        }
      }
    }

    reslovedData.push({
      displayName: item.displayName,
      registerNumber: item.registerNumber,
      classCode: item.classCode,
      classGrade: item.classGrade,
      point: Number(item.point),
      grade: item.grade,
      academicYear: ACADEMIC_YEAR,
      gradeId: SnowflakeId.generate().toString(),
      status: item.status,
      className: null,
      semester: CURRECT_SEMESTER + 1,
      teacherName: null,
      termId: null,
      systemId:
        users.find((user) => user.registerNumber === item.registerNumber)
          ?.systemId || ''
    })
  }
  try {
    const payload = await prisma.grade.createMany({
      data: reslovedData
    })

    return {
      message: `Дүнг амжилттай хадгаллаа. ${payload.count} дүн хадгалагдсан байна.`
    }
  } catch (error) {
    console.error('Error saving grades:', error)
    return {
      errors: {
        message: 'Дүнг хадгалахад алдаа гарлаа. Дүнг шалгаад дахин оролдоно уу.'
      }
    }
  }
}

export type GetUnelgeeDataFormState =
  | {
      errors?: {
        message?: string
      }
      message?: string
    }
  | undefined
