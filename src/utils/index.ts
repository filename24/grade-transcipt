import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import prisma from '@/utils/prisma'
import { ClassCode } from '@/types/ESIS'
import type { Grade } from '@prisma/client'

export * from './fetch'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getGradeData(registerNumber: string) {
  return await prisma.grade.findMany({
    where: {
      registerNumber,
    },
    select: {
      classCode: true,
      grade: true,
      status: true,
    },
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
      totalGradePoints += gradeScale * 1 // 각 학점을 100점 만점으로 계산
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
  'I',
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
