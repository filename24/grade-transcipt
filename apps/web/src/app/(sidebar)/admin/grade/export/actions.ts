'use server'

import * as Sentry from '@sentry/nextjs'
import prisma from '@gt/database'

import {
  fetchStudentByRegisterNumber,
  getStudentGradeRecords,
  type StudentGradeRecord
} from '@/utils/fetch'
import { resolveClassCode } from '@/utils'

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

// 성적 데이터 조회 액션 (ESIS + Prisma Grade 병합)
export async function fetchStudentGradesAction(
  personId: string,
  startYear: string,
  endYear: string,
  currentAcademicYear: string,
  currentAcademicLevel: string
) {
  try {
    // 1. ESIS에서 성적 데이터 가져오기
    const esisGrades = await getStudentGradeRecords(personId)

    // 2. 학년도 필터링
    const filteredGrades = esisGrades.filter((g) => {
      if (!g.academicYear) return false
      const year = Number.parseInt(g.academicYear, 10)
      const start = Number.parseInt(startYear, 10)
      const end = Number.parseInt(endYear, 10)
      return year >= start && year <= end
    })

    // 3. ESIS에 없는 년도 찾기
    const start = Number.parseInt(startYear, 10)
    const end = Number.parseInt(endYear, 10)
    const requestedYears = Array.from(
      { length: end - start + 1 },
      (_, i) => String(start + i)
    )

    const esisYears = new Set(
      filteredGrades.map((g) => g.academicYear).filter(Boolean)
    )
    const missingYears = requestedYears.filter((year) => !esisYears.has(year))

    // 4. 누락된 년도의 성적을 Prisma Grade에서 조회
    let prismaGrades: StudentGradeRecord[] = []

    if (missingYears.length > 0) {
      const gradeData = await prisma.grade.findMany({
        where: {
          systemId: personId,
          academicYear: { in: missingYears }
        },
        orderBy: [{ academicYear: 'desc' }, { semester: 'asc' }, { id: 'asc' }]
      })

      const currentYear = Number.parseInt(currentAcademicYear, 10)
      const currentLevel = Number.parseInt(currentAcademicLevel, 10)

      // Prisma Grade 데이터를 StudentGradeRecord 형식으로 변환
      prismaGrades = gradeData.map((g, index) => {
        // 학년 역산: 현재 년도와 학년을 기준으로 과거 데이터의 학년 계산
        // 예: 현재 2025년 5학년 -> 2023년 데이터는 3학년
        const dataYear = Number.parseInt(g.academicYear, 10)
        const yearDiff = currentYear - dataYear
        const calculatedLevel = currentLevel - yearDiff

        // classCode에서 "заавал" 또는 "сонгон" 제거하여 순수 코드만 추출
        // 예: "ИБЛ заавал" -> "ИБЛ", "АХЛ сонгон" -> "АХЛ"
        const pureClassCode = g.classCode.split(' ')[0]

        // 필수/선택 과목 판단 (classCode에 "заавал" 포함 여부)
        const isCompulsory = g.classCode.toLowerCase().includes('заавал')

        // academicLevel에 학기 정보 포함 (Prisma 데이터 식별용)
        // 형식: "12_S1" (12학년 1학기), "12_S2" (12학년 2학기)
        const academicLevelWithSemester = `${calculatedLevel}_S${g.semester}`

        return {
          id: index, // subjectAreaId 대체 (정렬용)
          className: resolveClassCode(g.classCode), // classCode resolve (예: "ИБЛ заавал" -> "Иргэний боловсрол ...")
          classCode: pureClassCode, // 순수 classCode만 사용 (중복 방지)
          point: Number(g.point),
          grade: g.grade,
          schoolName: '', // Prisma에는 학교명 없음
          academicLevel: academicLevelWithSemester, // 학년 + 학기 정보
          academicYear: g.academicYear,
          isCompulsory
        }
      })
    }

    // 5. ESIS 데이터와 Prisma 데이터 병합
    const allGrades = [...filteredGrades, ...prismaGrades]

    if (allGrades.length === 0) {
      return { success: false, error: 'Өгөгдөл олдсонгүй (데이터 없음).' }
    }

    // 6. 정렬: 필수 과목 위, 선택 과목 아래
    const compulsory = []
    const elective = []

    for (const grade of allGrades) {
      if (grade.isCompulsory) {
        compulsory.push(grade)
      } else {
        elective.push(grade)
      }
    }

    const finalData = [...compulsory, ...elective]

    return { success: true, data: finalData }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'grade-export' },
      extra: { personId, startYear, endYear }
    })
    return { success: false, error: 'Дүн татах алдаа (성적 조회 오류).' }
  }
}
