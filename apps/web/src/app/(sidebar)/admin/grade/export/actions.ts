'use server'

import * as Sentry from '@sentry/nextjs'

import {
  fetchStudentByRegisterNumber,
  getStudentGradeRecords
} from '@/utils/fetch'

export async function searchStudentAction(regNum: string) {
  try {
    const student = await fetchStudentByRegisterNumber(regNum)

    if (!student) {
      return {
        success: false,
        error: 'Сурагч олдсонгүй (학생을 찾을 수 없습니다).'
      }
    }
    return { success: true, data: student }
  } catch (error) {
    Sentry.captureException(error)
    return { success: false, error: 'Системийн алдаа (시스템 오류 발생).' }
  }
}

// 성적 데이터 조회 액션 (getStudentGradeRecords 재사용)
export async function fetchStudentGradesAction(
  personId: string,
  startYear: string,
  endYear: string
) {
  try {
    // 1. 기존 유틸리티 함수 재사용
    const grades = await getStudentGradeRecords(personId)

    // 2. 학년도 필터링
    const filteredGrades = grades.filter((g) => {
      if (!g.academicYear) return false
      const year = Number.parseInt(g.academicYear, 10)
      const start = Number.parseInt(startYear, 10)
      const end = Number.parseInt(endYear, 10)
      return year >= start && year <= end
    })

    if (filteredGrades.length === 0) {
      return { success: false, error: 'Өгөгдөл олдсонгүй (데이터 없음).' }
    }

    // 3. 정렬: subjectAreaId (fetch.ts에서 이미 id로 정렬되어 있지만, 필요시 재정렬)
    // getStudentGradeRecords는 학년 역순 -> ID 순입니다.
    // 엑셀 요구사항: 필수 과목 위, 선택 과목 아래

    const compulsory = []
    const elective = []

    for (const grade of filteredGrades) {
      if (grade.isCompulsory) {
        compulsory.push(grade)
      } else {
        elective.push(grade)
      }
    }

    const finalData = [...compulsory, ...elective]

    return { success: true, data: finalData }
  } catch (error) {
    Sentry.captureException(error)
    return { success: false, error: 'Дүн татах алдаа (성적 조회 오류).' }
  }
}
