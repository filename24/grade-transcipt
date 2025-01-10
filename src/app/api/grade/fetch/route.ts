import {
  ClassInfo,
  ResponseData,
  SemesterInfo,
  StudentGrade
} from '@/types/ESIS'
import * as esis from '@/utils/esis'
import { Prisma } from '@prisma/client'
import prisma from '@/utils/prisma'

const STUDENT_GROUP_ID = '100004237680887'

export async function GET(_request: Request) {
  await esis.tryLogin()

  const semesterInfo = await esis.api
    .get<ResponseData<SemesterInfo[]>>(
      `journal/terms/list/${esis.userData?.institutionId}/${esis.userData?.academicYear}`
    )
    .then((res) => res.data.RESULT)

  const currectSemester = semesterInfo[0]

  const gradeInfo = await esis.api
    .get<ResponseData<ClassInfo[]>>(
      `/journal/group/list/${esis.userData?.institutionId}/${STUDENT_GROUP_ID}/${currectSemester.termId}`
    )
    .then((res) => res.data.RESULT)

  const studentGrades: Prisma.GradeCreateInput[] = []

  await Promise.all(
    gradeInfo.map(async (classInfo) => {
      const gradeList = await esis.api
        .get<ResponseData<StudentGrade[]>>(
          `/journal/group/student/list/${esis.userData?.institutionId}/${classInfo.classId}/${STUDENT_GROUP_ID}/${esis.userData?.academicYear}/${currectSemester.termId}`
        )
        .then((res) => res.data.RESULT)
      if (!gradeList) return console.log('No grade list')

      console.log(gradeList[0].className, ' : ', gradeList.length)
      const grades = gradeList.map((student): (typeof studentGrades)[0] => {
        return {
          className: student.className,
          classCode: `${student.className.split(' ')[0]} ${student.className
            .split(' ')
            .pop()}`,
          displayName: student.displayName,
          gradeId: student.studentClassGradeId,
          grade: Number(student.gradeMark),
          registerNumber: student.primaryNidNumber,
          status: student.approvalStatus,
          termId: student.termId
        }
      })

      studentGrades.push(...grades)
    })
  )
  for (const student of studentGrades) {
    try {
      await prisma.grade.upsert({
        where: { gradeId: student.gradeId },
        update: { grade: student.grade, status: student.status },
        create: student
      })
    } catch (e) {
      console.error(e)
    }
  }

  return Response.json(
    {
      data: {
        size: studentGrades.length
      },
      message: 'Success'
    },
    { status: 200 }
  )
}
