import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import prisma from '@/utils/prisma'
import { ClassCode } from '@/types/ESIS'

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
