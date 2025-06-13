import type {
  SubjectCourseData,
  CourseInfo,
  ResponseData,
  HalfYearInfo,
  StudentGrade,
  ExamSession,
  StudentExamPayload
} from '@gt/esis'
import type { Exam, Grade, Prisma, UnelgeeSubjects } from '@gt/database'
import prisma from '@gt/database'
import { ACADEMIC_YEAR, CURRECT_SEMESTER, SCHOOL_ID } from './constants'
import { resolveClassCode, toSentenceCase } from '.'
import { unstable_cache } from 'next/cache'
import axios from 'axios'
import type {
  AsuulgaData,
  EECResponseData,
  LoginResponse
} from '@/types/unelgee'
import esis, { connectEsis } from './esis'

export const getStudentGradeRecords = unstable_cache(
  async (userId: string): Promise<StudentGradeRecord[]> => {
    if (!esis.isReady()) {
      await connectEsis()
    }
    const rawRecords = await esis.get<ResponseData<SubjectCourseData[]>>(
      `/svc/api/hub/student/course/grade/${userId}`,
      { cache: 'force-cache' }
    )

    const record: StudentGradeRecord[] = rawRecords
      .map((record) => ({
        id: record.subjectAreaId,
        className: resolveClassCode(
          `${record.subjectAreaCode} ${record.courseClassification === '1' ? 'заавал' : 'сонгон'}`
        ),
        classCode: record.subjectAreaCode,
        point: Number(record.gradeMark),
        grade: record.gradeCode,
        schoolName: record.organizationName,
        academicLevel: record.academicLevel,
        academicYear: record.academicYear
      }))
      .sort((a, b) => {
        if (Number(b.academicLevel) !== Number(a.academicLevel)) {
          return Number(b.academicLevel) - Number(a.academicLevel)
        }
        return a.id - b.id
      })

    return record
  },
  ['record'],
  { revalidate: 60 * 60 * 24 * 7, tags: ['record'] }
)

export interface StudentGradeRecord {
  id: number
  className: string
  classCode: string
  point: number
  grade: string
  schoolName: string
  academicLevel: string
  academicYear: string
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

/**
 * Need migrate for hub api
 */
export async function fetchStudentGrades(groupId: string) {
  const token = await connectEsis()
  esis.connect(token)
  const semesterInfo = await esis.get<ResponseData<HalfYearInfo[]>>(
    `journal/terms/list/${SCHOOL_ID}/${ACADEMIC_YEAR}`
  )

  const currectSemester = semesterInfo[CURRECT_SEMESTER]

  const gradeInfo = await esis.get<ResponseData<CourseInfo[]>>(
    `/journal/group/list/${SCHOOL_ID}/${groupId}/${currectSemester.termId}`
  )

  const studentGrades: Omit<Prisma.GradeCreateInput, 'id'>[] = []

  await Promise.all(
    gradeInfo.map(async (classInfo) => {
      const gradeList = await esis.get<ResponseData<StudentGrade[]>>(
        `/journal/group/student/list/${SCHOOL_ID}/${classInfo.classId}/${groupId}/${ACADEMIC_YEAR}/${currectSemester.termId}`
      )

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

export type FetchType = 'create' | 'edit' | 'forceEdit'
export async function fetchGradeData(
  groupId: string,
  type: 'create'
): Promise<number>
export async function fetchGradeData(
  groupId: string,
  type: 'edit'
): Promise<Prisma.GradeCreateInput[]>
export async function fetchGradeData(
  groupId: string,
  type: 'forceEdit'
): Promise<Prisma.GradeCreateInput[]>
export async function fetchGradeData(
  groupId: string,
  type: FetchType
): Promise<number | Prisma.GradeCreateInput[]> {
  const studentGrades = await fetchStudentGrades(groupId)
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

export async function fetchStudentTests(groupId: string) {
  if (!esis.isReady()) {
    await connectEsis()
  }
  const examSchedules = await esis.get<ResponseData<ExamSession[]>>(
    `/svc/api/hub/service/exam/component/sessions/${groupId}`,
    { cache: 'force-cache' }
  )
  const studentExamData: Omit<Prisma.ExamCreateInput, 'id'>[] = []

  for (let index = 0; index < examSchedules.length; index++) {
    const examSchedule = examSchedules[index]

    const examPayloads = await esis.get<ResponseData<StudentExamPayload[]>>(
      `/svc/api/hub/service/exam/candidate/grades/${groupId}/${examSchedule.TEST_COMPONENT_SESSION_ID}`
    )

    if (examPayloads.length === 0) {
      continue
    }
    for (let innerIndex = 0; innerIndex < examPayloads.length; innerIndex++) {
      const examData = examPayloads[innerIndex]

      studentExamData.push({
        academicLevel: examData.ACADEMIC_LEVEL,
        grade: examData.GRADE_CODE,
        name: examData.EXAM_NAME,
        point: examData.PERCENTILE,
        status: examData.APPROVAL_STATUS,
        systemId: String(examData.PERSON_ID),
        testId: String(examData.TEST_CAND_COMPONENT_ID),
        type: examData.EXAM_TYPE
      })
    }
  }

  return studentExamData
}

export async function fetchTestData(
  groupId: string,
  type: 'create'
): Promise<number>
export async function fetchTestData(
  groupId: string,
  type: 'edit'
): Promise<Prisma.ExamCreateInput[]>
export async function fetchTestData(
  groupId: string,
  type: 'forceEdit'
): Promise<Prisma.ExamCreateInput[]>
export async function fetchTestData(
  groupId: string,
  type: FetchType
): Promise<number | Prisma.ExamCreateInput[]> {
  const studentExams = await fetchStudentTests(groupId)
  const fetchedData: Prisma.ExamCreateInput[] = []
  const originData: Omit<Prisma.ExamCreateInput, 'id'>[] =
    await prisma.exam.findMany({
      where: {
        systemId: {
          in: studentExams.map((student) => student.systemId)
        }
      },
      select: {
        academicLevel: true,
        grade: true,
        name: true,
        point: true,
        status: true,
        systemId: true,
        testId: true,
        type: true
      }
    })

  if (type === 'create') {
    const existingTestIds = originData.map((exam) => exam.testId)
    const newExams = studentExams.filter(
      (exam) => !existingTestIds.includes(exam.testId)
    )

    if (newExams.length === 0) return 0

    const data = await prisma.exam.createMany({
      data: newExams
    })

    return data.count
  }

  if (type === 'forceEdit') {
    for (const student of studentExams) {
      try {
        await prisma.exam.upsert({
          where: { testId: student.testId },
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
    for (const student of studentExams) {
      const originStudent = originData.find(
        (origin) => origin.testId === student.testId
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
            await prisma.exam.update({
              where: { testId: originStudent.testId },
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

export async function getStudentExams(systemId: string): Promise<Exam[]> {
  const data = await prisma.exam.findMany({
    where: { systemId },
    orderBy: {
      point: 'desc'
    }
  })

  return data
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
