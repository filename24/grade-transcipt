import type {
  ClassInfo,
  ResponseData,
  SemesterInfo,
  StudentGrade
} from '@/types/ESIS'
import * as esis from '@/utils/esis'
import type { Grade, Prisma } from '@prisma/client'
import prisma from '@/utils/prisma'

export async function getGradeData(groupId: string) {
  await esis.tryLogin()

  const semesterInfo = await esis.api
    .get<ResponseData<SemesterInfo[]>>(
      `journal/terms/list/${esis.userData?.institutionId}/${esis.userData?.academicYear}`
    )
    .then((res) => res.data.RESULT)

  const currectSemester = semesterInfo[0]

  const gradeInfo = await esis.api
    .get<ResponseData<ClassInfo[]>>(
      `/journal/group/list/${esis.userData?.institutionId}/${groupId}/${currectSemester.termId}`
    )
    .then((res) => res.data.RESULT)

  const studentGrades: Omit<Prisma.GradeCreateInput, 'id'>[] = []

  await Promise.all(
    gradeInfo.map(async (classInfo) => {
      const gradeList = await esis.api
        .get<ResponseData<StudentGrade[]>>(
          `/journal/group/student/list/${esis.userData?.institutionId}/${classInfo.classId}/${groupId}/${esis.userData?.academicYear}/${currectSemester.termId}`
        )
        .then((res) => res.data.RESULT)
      if (!gradeList) return console.log('No grade list')

      console.log(gradeList[0].className, ' : ', gradeList.length)
      const grades = gradeList.map((student): (typeof studentGrades)[0] => {
        return {
          className: student.className,
          classCode: `${student.className.split(' ')[0]} ${student.className
            .split(' ')
            .pop()
            ?.toLowerCase()}`,
          displayName: student.displayName,
          gradeId: student.studentClassGradeId,
          grade: student.gradeCode,
          point: Number(student.gradeMark),
          registerNumber: student.primaryNidNumber,
          status: student.approvalStatus,
          termId: student.termId,
          teacherName: classInfo.instructorName,
          classGrade: student.studentGroupName,
          semester: Number(currectSemester.termSeq),
          academicYear:
            esis.userData?.academicYear || String(new Date().getUTCFullYear()),
          systemId: student.personId
        }
      })

      studentGrades.push(...grades)
    })
  )

  return studentGrades
}

export type FetchGradeType = 'create' | 'edit' | 'forceEdit'
export function fetchGradeData(groupId: string, type: 'create'): Promise<number>
export function fetchGradeData(
  groupId: string,
  type: 'edit'
): Promise<Prisma.GradeCreateInput[]>
export function fetchGradeData(
  groupId: string,
  type: 'forceEdit'
): Promise<Prisma.GradeCreateInput[]>
export async function fetchGradeData(
  groupId: string,
  type: FetchGradeType
): Promise<number | Prisma.GradeCreateInput[]> {
  const studentGrades = await getGradeData(groupId)
  const fetchedData: Prisma.GradeCreateInput[] = []
  const originData: Omit<Prisma.GradeCreateInput, 'id'>[] =
    await prisma.grade.findMany({
      where: {
        registerNumber: {
          in: studentGrades.map((student) => student.registerNumber)
        }
      },
      select: {
        point: true,
        className: true,
        classCode: true,
        displayName: true,
        gradeId: true,
        grade: true,
        registerNumber: true,
        status: true,
        termId: true,
        classGrade: true,
        semester: true,
        teacherName: true,
        academicYear: true,
        systemId: true
      }
    })

  if (type === 'create') {
    const existingGradeIds = originData.map((grade) => grade.gradeId)
    const newGrades = studentGrades.filter(
      (grade) => !existingGradeIds.includes(grade.gradeId)
    )

    if (newGrades.length === 0) return 0

    const data = await prisma.grade.createMany({
      data: newGrades
    })

    return data.count
  }

  if (type === 'forceEdit') {
    for (const student of studentGrades) {
      try {
        await prisma.grade.upsert({
          where: { gradeId: student.gradeId },
          update: student,
          create: student
        })
        fetchedData.push(student)
      } catch (e) {
        console.error(student)
        console.error(e)
      }
    }
  }

  if (type === 'edit') {
    for (const student of studentGrades) {
      const originStudent = originData.find(
        (origin) => origin.gradeId === student.gradeId
      )

      if (originStudent) {
        // Check if there are any differences
        const hasChanges = Object.keys(student).some(
          (key) =>
            student[key as keyof typeof student] !==
            originStudent[key as keyof typeof originStudent]
        )

        if (hasChanges) {
          try {
            await prisma.grade.update({
              where: { gradeId: originStudent.gradeId },
              data: student
            })
            fetchedData.push(student)
          } catch (e) {
            console.error(student)
            console.log('origin:', originStudent)
            console.error(e)
          }
        }
      }
    }
  }

  return fetchedData
}

export async function getStudentGrade(
  displayName: string,
  semester: number
): Promise<Grade[]> {
  const data = await prisma.grade.findMany({
    where: { displayName, semester },
    orderBy: {
      point: 'desc'
    }
  })

  return data
}
