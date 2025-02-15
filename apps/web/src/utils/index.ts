import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import prisma from '@gt/database'
import { CourseCode } from '@gt/esis'
import type { Grade } from '@gt/database'
import {
  type EducationLevel,
  SEMESTER_DATE,
  type SemesterLevel
} from './constants'
import type { StudentGradeRecord } from '.'

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

  return `${CourseCode[className as keyof typeof CourseCode]} ${section === 'заавал' ? '' : section}`
}

export function calcGPA(grades: Grade[]): number {
  if (grades.length === 0) return 0

  const totalCredits = grades.reduce((acc, _grade) => acc + 1, 0)
  let totalGradePoints = 0

  grades.map((grade) => {
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

export type GradePointOnly = Partial<Grade> & { point: number }

export function calcAverageGrade(grades: GradePointOnly[]): number {
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
  }
  if (diffDays > 0) {
    return `D-${diffDays}`
  }

  return `D+${Math.abs(diffDays)}`
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
  ;(Object.keys(SEMESTER_DATE) as EducationLevel[]).map((level) => {
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
  const grade = Number.parseInt(classCode)

  if (grade >= 1 && grade <= 6) {
    return 'ELEMENTARY'
  }
  if (grade >= 7 && grade <= 9) {
    return 'MIDDLE'
  }
  if (grade >= 10 && grade <= 12) {
    return 'HIGH'
  }
  return null
}

export function getGradeCode(gradePoint: number): string {
  if (gradePoint >= 90) return 'VIII'
  if (gradePoint >= 80) return 'VII'
  if (gradePoint >= 70) return 'VI'
  if (gradePoint >= 60) return 'V'
  if (gradePoint >= 50) return 'IV'
  if (gradePoint >= 40) return 'III'
  if (gradePoint >= 30) return 'II'
  return 'I'
}

export function isElementarySchool(academicLevel: string): boolean {
  const match = academicLevel.trim().match(/^(\d+)-р анги$/)
  if (!match) return false

  const grade = Number.parseInt(match[1], 10)
  return grade >= 1 && grade <= 5
}

export function filterUniqueClassNames(
  records: StudentGradeRecord[]
): StudentGradeRecord[] {
  const seen = new Set<string>()
  return records.filter((record) => {
    if (seen.has(record.className)) {
      return false
    }
    seen.add(record.className)
    return true
  })
}
