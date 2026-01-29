'use server'

import prisma from '@gt/database'
import { SubjectName } from '@gt/esis'
import * as Sentry from '@sentry/nextjs'

import { resolveClassCode } from '@/utils'

export async function getGradesByRegisterNumber(registerNumber: string) {
  try {
    const grades = await prisma.grade.findMany({
      where: { registerNumber }
    })

    // /dash/grade 페이지와 동일한 정렬 로직 적용
    const getSubjectId = (name: string) => {
      const isElective = name.includes(' / Сонгон судлах /')
      const cleanName = name.replace(' / Сонгон судлах /', '').trim()
      const subject = SubjectName.find((s) => s.subjectName === cleanName)
      return (subject ? subject.subjectAreaId : 9999) + (isElective ? 10000 : 0)
    }

    // 정렬 우선순위: 1) 학년도 (내림차순) 2) 학기 (내림차순) 3) 과목 ID (오름차순)
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
      return getSubjectId(aName) - getSubjectId(bName)
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
