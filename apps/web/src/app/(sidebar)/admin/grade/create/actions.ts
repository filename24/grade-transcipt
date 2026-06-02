'use server'

import * as Sentry from '@sentry/nextjs'
import '@gt/database'
import prisma, { type Grade } from '@gt/database'

import { SnowflakeId } from '@/utils'
import { CURRECT_ACADEMIC_YEAR, CURRECT_SEMESTER } from '@/utils/constants'

import type { GradeData } from './_Components/Gradetable'

export async function createGrades(
  _state: GetUnelgeeDataFormState,
  gradeData: GradeData[]
): Promise<GetUnelgeeDataFormState> {
  const reslovedData: Omit<Grade, 'id'>[] = []
  // 첫 실패에서 중단하지 않고 못 찾은 학생 이름을 모두 모은다.
  const missingNames: string[] = []
  try {
    const users = await prisma.user.findMany()
    const usersByName = new Map(users.map((user) => [user.name, user]))

    for (const item of gradeData) {
      // 점수가 없거나 0인 행(빈 행 포함)은 건너뛴다.
      if (!item.point || item.point === 0) {
        continue
      }

      const user = usersByName.get(item.displayName)
      if (!user) {
        missingNames.push(item.displayName)
        continue
      }

      reslovedData.push({
        displayName: item.displayName,
        registerNumber: user.registerNumber || '',
        classCode: item.classCode,
        classGrade: item.classGrade,
        point: Number(item.point),
        grade: item.grade,
        academicYear: CURRECT_ACADEMIC_YEAR,
        gradeId: SnowflakeId.generate().toString(),
        status: item.status,
        className: null,
        semester: CURRECT_SEMESTER + 1,
        teacherName: null,
        termId: null,
        systemId: user.systemId || ''
      })
    }

    // 못 찾은 학생이 하나라도 있으면 저장하지 않고 전체 목록을 한 번에 알린다.
    if (missingNames.length > 0) {
      const uniqueNames = [...new Set(missingNames)]
      return {
        errors: {
          message: `Сурагчын мэдээлэл олдсонгүй (${uniqueNames.length}): ${uniqueNames.join(', ')}`
        }
      }
    }

    const payload = await prisma.grade.createMany({
      data: reslovedData
    })

    return {
      message: `Дүнг амжилттай хадгаллаа. ${payload.count} дүн хадгалагдсан байна.`
    }
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { feature: 'admin-grade-create' },
      extra: {
        gradeCount: gradeData.length,
        resolvedCount: reslovedData.length
      }
    })
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
