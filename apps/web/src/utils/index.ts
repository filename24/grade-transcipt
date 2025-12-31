import type { Grade } from '@gt/database'
import { CourseCode } from '@gt/esis'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import {
  CDN_ENDPOINT,
  type EducationLevel,
  EXAM_DATE,
  FREE_LEARNING_WEEK,
  GRADUATION_DATE,
  SEMESTER_DATE,
  type SemesterLevel
} from './constants'
import type { StudentGradeRecord } from './fetch'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveClassCode(classCode: string) {
  const [className, section] = classCode.split(' ')

  return `${CourseCode[className as keyof typeof CourseCode]} ${section === 'сонгон' ? '/ Сонгон судлах /' : ''}`
}

export function calcGPA(grades: GradePointOnly[]): number {
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

export type GradePointOnly = Pick<Grade, 'point'>

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
 * 특정 날짜를 입력받아 오늘과의 차이에 따라 D-Day 숫자를 반환하는 함수
 * 0 일경우 D-Day
 * `-number` 일경우 D-number
 * `+number` 일경우 D+number
 * @param targetDate 목표 날짜 (Date 형식)
 * @param returnType 받을 타입 (string | number)
 * @returns 목표 날짜까지 남은 일 수에 따른 day 숫자
 */
export function getDDay(targetDate: Date, returnType: 'number'): number
/**
 * 특정 날짜를 입력받아 오늘과의 차이에 따라 D-Day 문구를 반환하는 함수
 * @param targetDate 목표 날짜 (Date 형식)
 * @param returnType 받을 타입 (string | number)
 * @returns 목표 날짜까지 남은 일 수에 따른 D-Day 문자열
 */
export function getDDay(targetDate: Date, returnType: 'string'): string
/**
 * 특정 날짜를 입력받아 오늘과의 차이에 따라 D-Day 문구를 반환하는 함수
 * @param targetDate 목표 날짜 (Date 형식)
 * @param returnType 받을 타입 (string | number)
 * @returns 목표 날짜까지 남은 일 수에 따른 D-Day 문자열
 */
export function getDDay(targetDate: Date): string
export function getDDay(
  targetDate: Date,
  returnType: 'string' | 'number' = 'string'
): string | number {
  const today = Date.now()

  const diffDays = Math.ceil(
    (targetDate.getTime() - today) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) {
    if (returnType === 'string') return 'D-Day'
    return 0
  }
  if (diffDays > 0) {
    if (returnType === 'string') return `D-${diffDays}`
    return Number(`-${diffDays}`)
  }

  if (returnType === 'string') return `D+${Math.abs(diffDays)}`
  return diffDays
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

export function calculateGradeCode(gradePoint: number): string {
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
  const grade = Number.parseInt(academicLevel)
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

export function getFirstCharOfFirstWord(str: string) {
  // 공백 제거 후 공백 기준으로 분리
  const words = str.trim().split(' ')
  // 첫 번째 단어가 있으면 첫 문자를 반환, 없으면 빈 문자열 반환
  return words.length > 0 && words[0].length > 0 ? words[0][0] : ''
}

/**
 * 문자열을 Sentence case로 변환하는 함수
 * 첫 번째 문자를 대문자로, 나머지를 소문자로 변환
 * @param str 입력 문자열
 * @returns Sentence case로 변환된 문자열
 * @example
 * toSentenceCase("javascript") // "Javascript"
 */
export function toSentenceCase(str: string): string {
  // 입력이 빈 문자열이거나 유효하지 않은 경우 빈 문자열 반환
  if (!str || typeof str !== 'string') {
    return ''
  }

  // 첫 문자 대문자, 나머지 소문자로 변환
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function parseTextToArray(inputText: string) {
  // 입력이 문자열이 아니거나 빈 문자열인 경우 빈 배열 반환
  if (typeof inputText !== 'string' || inputText.trim() === '') {
    return []
  }

  // 줄바꿈 문자(\n 또는 \r\n)를 기준으로 문자열을 분리하고, 빈 문자열 제거
  const lines = inputText
    .split(/\r?\n/) // \r\n(Windows) 또는 \n(MacOS/Linux)을 처리
    .map((line) => line.trim()) // 각 줄의 앞뒤 공백 제거
    .filter((line) => line !== '') // 빈 줄 제거

  return lines
}

import { Snowflake } from '@sapphire/snowflake'

const epoch = new Date(2023, 9, 1)
export const SnowflakeId = new Snowflake(epoch)

export function getUserDefaultAvatarUrl(systemId: string) {
  return `${CDN_ENDPOINT}/profile/default_${Number(systemId.replace(/\D/g, '')) % 7}.png`
}

export function makeDashboardMessage(now: Date) {
  let semesterLevel: 1 | 2 | 3 = 1
  for (const key of [1, 2, 3] as const) {
    const { START, END } = SEMESTER_DATE.HIGH[key]
    if (now >= START && now <= END) {
      semesterLevel = key
      break
    }
  }
  const semesterDates = SEMESTER_DATE.HIGH[semesterLevel]
  const vacationStart = semesterDates.END
  const vacationEnd = semesterLevel === 1 ? SEMESTER_DATE.HIGH[2].START : null

  const isFreeLearningWeek = FREE_LEARNING_WEEK.some(
    (w) => now >= w.START && now <= w.END
  )
  const isExamWeek = now >= EXAM_DATE.START && now <= EXAM_DATE.END
  // getDDay가 3번째 인자를 받지 않으므로 직접 계산
  const graduationDiff = Math.ceil(
    (GRADUATION_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  const isGraduationSoon = graduationDiff <= 30 && graduationDiff > 0
  const isGraduated = now > GRADUATION_DATE
  const vacationDiff = vacationEnd
    ? Math.ceil((vacationEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null
  const vacationStartDiff = Math.ceil(
    (vacationStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  const isVacation = now > vacationStart && vacationEnd && now < vacationEnd

  let dashboardMessage = ''
  if (isGraduated) {
    dashboardMessage =
      'Амжилттай төгссөн танд баяр хүргэе. Цаашдын ажилд амжилт хүсье!'
  } else if (isExamWeek) {
    dashboardMessage = `${semesterLevel}-р улирал үргэлжилж байна. Улсын шалгалт явагдаж байна.`
  } else if (isFreeLearningWeek) {
    dashboardMessage = 'Бие даалтын долоо хоног үргэлжилж байна.'
  } else if (isVacation) {
    dashboardMessage = `${semesterLevel}-р улирлын амралт үргэлжилж байна. Амралт дуусахад ${vacationDiff !== null ? vacationDiff : ''} хоног үлдсэн байна.`
  } else if (isGraduationSoon) {
    dashboardMessage = `${semesterLevel}-р улирал үргэлжилж байна. Төгсөлт хүртэл ${graduationDiff} хоног үлдсэн байна.`
  } else {
    dashboardMessage = `${semesterLevel}-р улирал үргэлжилж байна. ${semesterLevel}-р улирлын амралт эхэлтэл ${vacationStartDiff} хоног үлдсэн байна.`
  }
  return dashboardMessage
}

export function formatDateToYYYYMMDD(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${isoDate}`)
  }
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0') // Months start from 0, so add 1
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
