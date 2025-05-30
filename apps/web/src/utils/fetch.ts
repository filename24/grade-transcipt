import type {
  AcademicYearData,
  SubjectCourseData,
  CourseInfo,
  ResponseData,
  HalfYearInfo,
  StudentGrade
} from '@gt/esis'
import * as esis from '@/utils/esis'
import type { Grade, Prisma, UnelgeeSubjects } from '@gt/database'
import prisma from '@gt/database'
import { ACADEMIC_YEAR, CURRECT_SEMESTER, SCHOOL_ID } from './constants'
import { getFirstCharOfFirstWord, resolveClassCode, toSentenceCase } from '.'
import { unstable_cache } from 'next/cache'
import axios from 'axios'
import type {
  AsuulgaData,
  EECResponseData,
  FormattedData,
  LoginResponse
} from '@/types/unelgee'

/**
 * 학생 학년 정보
 *
 * 만약에 학생 아카데믹 년도가 1개일경우 학생 id 가 없음으로 간주한다
 *
 * @param userId 학생 person id
 * @returns 학생이 진학한 학년을 출력한다
 */
export const getStudentAcademicYears = unstable_cache(
  async (userId: string) => {
    await esis.tryLogin()

    const academicYears = await esis.api
      .get<ResponseData<AcademicYearData[]>>(
        `/profile/stdntGrade/academicYear/${userId}`
      )
      .then((res) => res.data.RESULT)

    return academicYears
  },
  ['record'],
  { revalidate: 60 * 60 * 24 * 7, tags: ['record'] }
)

export const getStudentGradeRecords = unstable_cache(
  async (
    userId: string,
    academicLevel: string
  ): Promise<StudentGradeRecord[]> => {
    await esis.tryLogin()

    const rawRecords = await esis.api
      .get<ResponseData<SubjectCourseData[]>>(
        `https://svc5.esis.edu.mn/api/profile/stdntGrade/list/${userId}/0/${academicLevel}`
      )
      .then((res) => res.data.RESULT)

    const record: StudentGradeRecord[] = rawRecords.map((record) => ({
      className: resolveClassCode(
        `${record.subjectAreaCode} ${record.courseName
          .split(' ')
          .pop()
          ?.toLowerCase()}`
      ),
      classCode: record.subjectAreaCode,
      point: Number(record.gradeMark),
      grade: record.gradeCode,
      schoolName: record.organizationName,
      academicLevel: record.academicLevel
    }))

    return record
  },
  ['record'],
  { revalidate: 60 * 60 * 24 * 7, tags: ['record'] }
)

export interface StudentGradeRecord {
  className: string
  classCode: string
  point: number
  grade: string
  schoolName: string
  academicLevel: string
}

export async function getGradeData(groupId: string) {
  await esis.tryLogin()

  const semesterInfo = await esis.api
    .get<ResponseData<HalfYearInfo[]>>(
      `journal/terms/list/${SCHOOL_ID}/${ACADEMIC_YEAR}`
    )
    .then((res) => res.data.RESULT)

  const currectSemester = semesterInfo[CURRECT_SEMESTER]

  const gradeInfo = await esis.api
    .get<ResponseData<CourseInfo[]>>(
      `/journal/group/list/${SCHOOL_ID}/${groupId}/${currectSemester.termId}`
    )
    .then((res) => res.data.RESULT)

  const studentGrades: Omit<Prisma.GradeCreateInput, 'id'>[] = []

  await Promise.all(
    gradeInfo.map(async (classInfo) => {
      const gradeList = await esis.api
        .get<ResponseData<StudentGrade[]>>(
          `/journal/group/student/list/${SCHOOL_ID}/${classInfo.classId}/${groupId}/${ACADEMIC_YEAR}/${currectSemester.termId}`
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
          academicYear: ACADEMIC_YEAR || String(new Date().getUTCFullYear()),
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

export const getStudentDataWithName = unstable_cache(
  async (name: string) => {
    const data = await prisma.user.findFirst({
      where: {
        name
      }
    })

    return data
  },
  ['record'],
  { revalidate: 60 * 60 * 24 * 7, tags: ['record'] }
)

export async function getUnelgeeStudents(
  registerNumbers: string[],
  className: string,
  type: '1' | '2' = '1'
) {
  const responseData: Omit<UnelgeeSubjects, 'id'>[] = []

  console.log(registerNumbers)
  for (let index = 0; index < registerNumbers.length; index++) {
    const registerNumber = registerNumbers[index]

    const loginData = await axios.post<LoginResponse>(
      'https://asuulga-test-api.eec.mn/api/v1/login',
      {
        regNo: registerNumber,
        // 1: student, 2: parent
        type
      }
    )

    if (!loginData.data.result) {
      continue
    }

    const token = loginData.data.result.jwtToken

    const asuulgaData = await axios
      .get<EECResponseData<AsuulgaData[]>>(
        'https://asuulga-test-api.eec.mn/api/v1/survey/teacher?type=EBS',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then((d) => d.data)

    asuulgaData.result.map((data) => {
      console.log(data.student.firstName)
      responseData.push({
        lastName: toSentenceCase(data.student.lastName),
        firstName: toSentenceCase(data.student.firstName),
        grade: String(data.grade),
        registerNumber: data.student.regNo,
        lessonName: data.lesson.name,
        teacherFirstName: toSentenceCase(data.teacher.firstName),
        teacherLastName: toSentenceCase(data.teacher.lastName),
        schoolId: data.esisID,
        class: data.student.class || className
      })
    })
  }

  const payload = await prisma.unelgeeSubjects.createMany({
    data: responseData,
    skipDuplicates: true
  })

  return {
    count: payload.count,
    data: responseData
  }
}
