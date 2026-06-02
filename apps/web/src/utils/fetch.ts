import * as Sentry from '@sentry/nextjs'
import type { Exam, Grade, Prisma, UnelgeeSubjects } from '@gt/database'
import prisma from '@gt/database'
import type {
  ExamSession,
  GradeStatusType,
  GroupStudent,
  ResponseData,
  Student,
  StudentExamPayload,
  SubjectCourseData
} from '@gt/esis'
import axios from 'axios'
import { unstable_cache } from 'next/cache'

import type {
  AsuulgaData,
  EECResponseData,
  LoginResponse
} from '@/types/unelgee'

import { resolveClassCode, toSentenceCase } from '.'
import { CURRECT_ACADEMIC_YEAR } from './constants'
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
      .map((record) => {
        const isCompulsory =
          record.courseClassification === '1' ||
          record.courseClassificationName?.toLowerCase().includes('Заавал')

        return {
          id: record.subjectAreaId,
          className: resolveClassCode(
            `${record.subjectAreaCode} ${record.courseClassification === '1' ? '' : 'сонгон'}`
          ),
          classCode: record.subjectAreaCode,
          point: Number(record.gradeMark),
          grade: record.gradeCode,
          schoolName: record.organizationName,
          academicLevel: record.academicLevel,
          academicYear: record.academicYear,
          isCompulsory
        }
      })
      .sort((a, b) => {
        // 1순위: 학년 (높은 학년이 위로)
        if (Number(b.academicLevel) !== Number(a.academicLevel)) {
          return Number(b.academicLevel) - Number(a.academicLevel)
        }

        // 2순위: 필수/선택 (필수 과목이 위로)
        // true(1)인 경우가 false(0)보다 먼저 오도록 내림차순 정렬 (-1 반환)
        if (a.isCompulsory !== b.isCompulsory) {
          return a.isCompulsory ? -1 : 1
        }

        // 3순위: ID (기존 순서 유지)
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
  isCompulsory: boolean
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

export type FetchType = 'create' | 'edit' | 'forceEdit'

export async function fetchStudentTests(groupId: string) {
  if (!esis.isReady()) {
    await connectEsis()
  }
  const examSchedules = await esis.get<ResponseData<ExamSession[]>>(
    `/svc/api/hub/service/exam/component/sessions/${groupId}`,
    { cache: 'force-cache' }
  )
  const studentExamData: Omit<Prisma.ExamCreateManyInput, 'id'>[] = []

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
        status: examData.APPROVAL_STATUS as GradeStatusType,
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
        Sentry.captureException(e, {
          level: 'warning',
          tags: { feature: 'fetch-test-data', operation: 'force-edit' },
          extra: { testId: student.testId, systemId: student.systemId }
        })
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
            Sentry.captureException(e, {
              level: 'warning',
              tags: { feature: 'fetch-test-data', operation: 'edit' },
              extra: {
                testId: student.testId,
                originTestId: originStudent?.testId
              }
            })
          }
        }
      }
    }
  }

  return fetchedData
}

export async function getStudentExams(
  systemId: string,
  academicLevel: string
): Promise<Exam[]> {
  const data = await prisma.exam.findMany({
    where: { systemId, academicLevel },
    orderBy: {
      point: 'desc'
    }
  })

  return data
}

export async function getStudentGrade(
  systemId: string,
  semester: number,
  academicYear?: string
): Promise<Grade[]> {
  const data = await prisma.grade.findMany({
    where: {
      systemId,
      semester,
      academicYear: academicYear ?? CURRECT_ACADEMIC_YEAR
    },
    orderBy: {
      point: 'desc'
    }
  })

  return data
}

/**
 * 같은 반(classGrade)·학기·학년도에서 "전체 예상 과목 수"를 추정해 반환한다.
 * 수동으로 입력된 Grade 데이터만으로 추정해야 하므로(ESIS 수강 과목 조회가
 * deprecated), 같은 반 학생들 중 개별 학생이 가진 distinct classCode 수의
 * 최댓값을 전체 과목 수로 간주한다.
 *
 * 합집합(union)이 아니라 학생별 최댓값을 쓰는 이유: 선택과목 편차나 일부
 * 학생의 데이터 노이즈로 합집합이 부풀려지면 정상적으로 모든 과목 성적이 나온
 * 학생도 "완료"로 표시되지 않기 때문이다. 가장 과목이 많은 학생을 기준 삼으면
 * 이 편차에 강건하다. 성적이 하나도 없으면 0을 반환한다.
 */
export async function getGradeSubjectCount(
  classGrade: string,
  semester: number,
  academicYear: string
): Promise<number> {
  const grades = await prisma.grade.findMany({
    where: {
      classGrade,
      semester,
      academicYear
    },
    select: { systemId: true, classCode: true }
  })

  // 학생(systemId)별 distinct classCode 집합을 만든 뒤 그 크기의 최댓값을 구한다.
  const subjectsByStudent = new Map<string, Set<string>>()
  for (const grade of grades) {
    const subjects = subjectsByStudent.get(grade.systemId) ?? new Set<string>()
    subjects.add(grade.classCode)
    subjectsByStudent.set(grade.systemId, subjects)
  }

  let maxCount = 0
  for (const subjects of subjectsByStudent.values()) {
    if (subjects.size > maxCount) {
      maxCount = subjects.size
    }
  }

  return maxCount
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

export async function getUser(systemId?: string) {
  return unstable_cache(
    async () =>
      await prisma.user.findFirst({
        where: {
          systemId: systemId
        }
      }),
    [systemId || 'user-unknown'],
    { tags: ['users', `user-${systemId}`], revalidate: 60 * 5 }
  )()
}

export async function getUserInfoById(
  groupId: string
): Promise<GroupStudent[] | undefined>
export async function getUserInfoById(
  groupId: string,
  systemId: string
): Promise<GroupStudent | undefined>
export async function getUserInfoById(
  groupId: string,
  systemId?: string
): Promise<GroupStudent | GroupStudent[] | undefined> {
  const groupStudents = await esis.get<ResponseData<GroupStudent[]>>(
    `/svc/api/hub/group/student/list/${groupId}`,
    { cache: 'force-cache' }
  )

  if (systemId) {
    const student = groupStudents.find(
      (s) => String(s.PERSON_ID) === String(systemId)
    )
    return student
  }

  return groupStudents
}

export async function fetchStudentByRegisterNumber(registerNumber: string) {
  if (!esis.isReady()) {
    await connectEsis()
  }

  try {
    const response = await esis.get<ResponseData<Student[]>>(
      `/svc/api/hub/students/${registerNumber}`,
      { cache: 'force-cache' }
    )

    if (Array.isArray(response) && response.length > 0) {
      return response[0]
    }
    return null
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { feature: 'fetch-student', operation: 'by-register-number' },
      extra: { registerNumber }
    })
    return null
  }
}
