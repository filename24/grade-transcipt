'use server'
import type { z } from 'zod'
import type { EditGradeSchema } from './_Components/ChangeStateDialog'
import type { GradeStatusType } from '@gt/esis'
import prisma from '@gt/database'

export async function editGradeData(data: z.infer<typeof EditGradeSchema>) {
  const { className, classType, classGrade } = data
  const classCode = `${className} ${classType}`
  const status = data.status as GradeStatusType

  try {
    const payload = await prisma.grade.updateMany({
      where: {
        classCode,
        classGrade,
        semester: Number(data.semester)
      },
      data: {
        classCode,
        classGrade,
        status
      }
    })

    return {
      message: 'Grades updated successfully',
      payload
    }
  } catch (error) {
    console.error('Error updating grades:', error)
    throw error
  }
}
