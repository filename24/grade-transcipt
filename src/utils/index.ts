import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import prisma from '@/utils/prisma'
import { ClassCode } from '@/types/ESIS'
import type { Grade } from '@prisma/client'
import { EducationLevel, SEMESTER_DATE, SemesterLevel } from './constants'

export * from './fetch'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getGradeData(registerNumber: string) {
  return await prisma.grade.findMany({
    where: {
      registerNumber
    },
    select: {
      classCode: true,
      grade: true,
      status: true
    }
  })
}

export function resolveClassCode(classCode: string) {
  const [className, section] = classCode.split(' ')

  return `${ClassCode[className as keyof typeof ClassCode]} ${section}`
}

export function calcGPA(grades: Grade[]): number {
  if (grades.length === 0) return 0

  const totalCredits = grades.reduce((acc, _grade) => acc + 1, 0)
  let totalGradePoints = 0

  grades.forEach((grade) => {
    const gradeScale = getGradeScale(grade.point)
    if (gradeScale) {
      totalGradePoints += gradeScale * 1
    }
  })

  return Number((totalGradePoints / totalCredits).toFixed(1))
}

export function getGradeScale(grade: number): number | undefined {
  switch (true) {
    case grade >= 90 && grade <= 100:
      return 4
    case grade >= 80 && grade <= 89:
      return 3
    case grade >= 70 && grade <= 79:
      return 2
    case grade >= 60 && grade <= 69:
      return 1
    default:
      return undefined
  }
}

export function calcAverageGrade(grades: Grade[]): number {
  if (grades.length === 0) return 0

  const sum = grades.reduce((total, grade) => total + grade.point, 0)
  const average = sum / grades.length

  return Number(average.toFixed(1))
}

export const grades = [
  'VIII',
  'VII',
  'VI',
  'V',
  'IV',
  'III',
  'II',
  'I'
] as const
export interface GradeCounts {
  VIII: number
  VII: number
  VI: number
  V: number
  IV: number
  III: number
  II: number
  I: number
}

export function countGrades(gradesArray: Grade[]): GradeCounts {
  return grades.reduce<GradeCounts>((acc, grade) => {
    acc[grade] =
      (acc[grade] || 0) + gradesArray.filter((g) => g.grade === grade).length
    return acc
  }, {} as GradeCounts)
}

/**
 * 특정 날짜를 입력받아 오늘과의 차이에 따라 D-Day 문구를 반환하는 함수
 * @param targetDate 목표 날짜 (Date 형식)
 * @returns 목표 날짜까지 남은 일 수에 따른 D-Day 문자열
 */
export function getDDay(targetDate: Date): string {
  const today = new Date()
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )
  const eventDate = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  )

  const diffTime = eventDate.getTime() - currentDate.getTime()

  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'D-Day'
  } else if (diffDays > 0) {
    return `D-${diffDays}`
  } else {
    return `D+${Math.abs(diffDays)}`
  }
}

/**
 * 특정 교육 단계(초등, 중등, 고등)에서 현재 진행 중인 학기를 반환하는 함수
 * @param level 교육 단계 (ELEMENTARY, MIDDLE, HIGH)
 * @returns 현재 진행 중인 학기 번호가 있으면 그 번호를, 없으면 null을 반환
 */
export function getCurrentSemesterForLevel(
  level: EducationLevel
): SemesterLevel | null {
  const now = new Date()
  const semesters = SEMESTER_DATE[level]

  for (const sem in semesters) {
    const { START, END } = semesters[sem as unknown as 1 | 2 | 3]
    if (now >= START && now <= END) {
      return Number(sem) as SemesterLevel
    }
  }
  return null
}

/**
 * 모든 교육 단계의 현재 진행 중인 학기를 반환하는 함수
 * null - 학기 진행상황 알수없음
 * @returns {Object} { ELEMENTARY: 학기번호 | null, MIDDLE: 학기번호 | null, HIGH: 학기번호 | null }
 */
export function getCurrentSemesters(): Record<
  EducationLevel,
  SemesterLevel | null
> {
  const result: Record<EducationLevel, SemesterLevel | null> = {
    ELEMENTARY: null,
    MIDDLE: null,
    HIGH: null
  }
  ;(Object.keys(SEMESTER_DATE) as EducationLevel[]).forEach((level) => {
    result[level] = getCurrentSemesterForLevel(level)
  })

  return result
}

/**
 * 학년을 받아서 해당 학년이 어느 교육 단계(EducationLevel)에 속하는지 반환하는 함수
 * @param classCode 학년 (예: 3a, 7в, 10г 등)
 * @returns 해당 학년이 속하는 EducationLevel (ELEMENTARY, MIDDLE, HIGH), 범위에 없으면 null 반환
 */
export function getEducationLevelFromGrade(
  classCode: string
): EducationLevel | null {
  const grade = parseInt(classCode)

  if (grade >= 1 && grade <= 6) {
    return 'ELEMENTARY'
  } else if (grade >= 7 && grade <= 9) {
    return 'MIDDLE'
  } else if (grade >= 10 && grade <= 12) {
    return 'HIGH'
  }
  return null
}
