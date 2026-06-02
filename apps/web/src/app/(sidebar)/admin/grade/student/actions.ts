'use server'

import prisma from '@gt/database'
import * as Sentry from '@sentry/nextjs'
import { headers } from 'next/headers'
import { z } from 'zod'

import { getSubjectSortId, resolveClassCode, SnowflakeId } from '@/utils'
import { auth } from '@/utils/better-auth'

// 서버 액션은 클라이언트에서 독립적으로 호출 가능하므로 역할을 반드시 재검증한다.
async function assertAdmin(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
}

export async function getGradesByRegisterNumber(registerNumber: string) {
  await assertAdmin()
  try {
    const grades = await prisma.grade.findMany({
      where: { registerNumber }
    })

    // 정렬 우선순위: 1) 학년도 (내림차순) 2) 학기 (내림차순) 3) 과목 ID (오름차순)
    // 과목 정렬은 /dash/grade 와 동일한 getSubjectSortId 알고리즘을 사용한다.
    grades.sort((a, b) => {
      // 학년도 비교
      if (a.academicYear !== b.academicYear) {
        return b.academicYear.localeCompare(a.academicYear)
      }
      // 학기 비교
      if (a.semester !== b.semester) {
        return b.semester - a.semester
      }
      // 과목 ID 비교 (필수 과목 먼저, 선택 과목 나중)
      const aName = resolveClassCode(a.classCode)
      const bName = resolveClassCode(b.classCode)
      return getSubjectSortId(aName) - getSubjectSortId(bName)
    })

    return { success: true, data: grades }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-grade-student-lookup' },
      extra: { registerNumber }
    })
    console.error(error)
    return { success: false, error: '성적 조회에 실패했습니다' }
  }
}

const CreateGradeSchema = z.object({
  registerNumber: z.string().min(1),
  classCode: z.string().min(1),
  classGrade: z.string().min(1),
  point: z.number().min(0).max(100),
  grade: z.string().min(1),
  status: z.enum(['APPROVED', 'PENDING', 'REJECTED', 'NEW']),
  semester: z.number().int().min(1).max(3),
  academicYear: z.string().regex(/^\d{4}$/)
})

type CreateGradeInput = z.infer<typeof CreateGradeSchema>

export async function createGrade(input: CreateGradeInput) {
  await assertAdmin()
  const data = CreateGradeSchema.parse(input)

  try {
    // 성적은 systemId로 유저와 연결되므로 등록번호로 유저를 먼저 찾는다.
    const user = await prisma.user.findUnique({
      where: { registerNumber: data.registerNumber }
    })

    if (!user) {
      return {
        success: false,
        error: '해당 등록번호의 유저를 찾을 수 없습니다'
      }
    }

    const created = await prisma.grade.create({
      data: {
        systemId: user.systemId || '',
        gradeId: SnowflakeId.generate().toString(),
        teacherName: null,
        academicYear: data.academicYear,
        termId: null,
        semester: data.semester,
        displayName: user.name,
        registerNumber: data.registerNumber,
        classCode: data.classCode,
        className: null,
        classGrade: data.classGrade,
        grade: data.grade,
        point: data.point,
        status: data.status
      }
    })

    return { success: true, data: created }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-grade-student-create' },
      extra: { registerNumber: data.registerNumber }
    })
    return { success: false, error: '성적 추가에 실패했습니다' }
  }
}

export async function updateGrade(
  gradeId: string,
  data: {
    point: number
    grade: string
    status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NEW'
    semester: number
    academicYear: string
  }
) {
  await assertAdmin()
  try {
    const updated = await prisma.grade.update({
      where: { id: gradeId },
      data
    })

    return { success: true, data: updated }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-grade-student-update' },
      extra: { gradeId, updateData: data }
    })
    return { success: false, error: '성적 수정에 실패했습니다' }
  }
}

export async function deleteGrade(gradeId: string) {
  await assertAdmin()
  try {
    await prisma.grade.delete({
      where: { id: gradeId }
    })

    return { success: true, message: '성적이 삭제되었습니다' }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-grade-student-delete' },
      extra: { gradeId }
    })
    return { success: false, error: '성적 삭제에 실패했습니다' }
  }
}
