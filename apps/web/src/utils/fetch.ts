import type { Exam, Grade, Prisma, UnelgeeSubjects } from '@gt/database'
import prisma from '@gt/database'
import type {
  ExamCandidateGradeV2,
  ExamSessionV2,
  GradeStatusType,
  GraduateStudentInfoV2,
  GroupStudent,
  ResponseData,
  Student,
  StudentRegisterV2,
  SubjectCourseData
} from '@gt/esis'
import * as Sentry from '@sentry/nextjs'
import axios from 'axios'
import { unstable_cache } from 'next/cache'

import type {
  AsuulgaData,
  EECResponseData,
  LoginResponse
} from '@/types/unelgee'

import { resolveClassCode, toSentenceCase } from '.'
import { CURRECT_ACADEMIC_YEAR, SCHOOL_ID } from './constants'
import esis, { connectEsis } from './esis'
import esisV2 from './esis-v2'

const getStudentGradeRecordsCached = unstable_cache(
  async (userId: string): Promise<StudentGradeRecord[]> => {
    if (!esis.isReady()) {
      await connectEsis()
    }
    const rawRecords = await esis.get<ResponseData<SubjectCourseData[]>>(
      `/svc/api/hub/student/course/grade/${userId}`,
      { cache: 'force-cache' }
    )

    // RESULT 누락 등으로 배열이 아니면 throw해서 unstable_cache가
    // 빈 결과를 7일간 캐시(poison)하지 않도록 한다. 처리는 wrapper에서.
    if (!Array.isArray(rawRecords)) {
      throw new Error('ESIS student course grade returned no array')
    }

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

export async function getStudentGradeRecords(
  userId: string
): Promise<StudentGradeRecord[]> {
  try {
    return await getStudentGradeRecordsCached(userId)
  } catch (error) {
    // ESIS 통신 실패/빈 응답 시 크래시 대신 빈 배열로 degrade.
    // throw는 캐시되지 않으므로 다음 요청에서 자동 재시도된다.
    Sentry.captureException(error, {
      level: 'warning',
      tags: { feature: 'esis', operation: 'getStudentGradeRecords' },
      extra: { userId }
    })
    return []
  }
}

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

// ESIS 세션별 성적 조회를 동시에 보낼 최대 개수. 순차 호출은 세션 수가 많으면
// Hobby 플랜의 60초 함수 제한을 초과하므로 병렬화하되, ESIS 부하/레이트리밋을
// 막기 위해 동시성을 제한한다.
const EXAM_FETCH_CONCURRENCY = 5

/**
 * items를 limit개씩 동시에 처리하며 mapper 결과를 입력 순서대로 모은다.
 * 외부 라이브러리 없이 동작하는 간단한 bounded-concurrency 헬퍼.
 */
async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await mapper(items[index], index)
    }
  }

  const workerCount = Math.min(limit, items.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))

  return results
}

export async function fetchStudentTests(groupId: string) {
  // ESIS v2 시험 서비스로 이전됨. v2는 인증 불필요 프록시를 쓰며
  // institutionId 쿼리가 필수다.
  const examSchedules = await esisV2.get<ResponseData<ExamSessionV2[]>>(
    `/svc/api/hub/v2/service/exam/component/sessions/${groupId}`,
    { institutionId: SCHOOL_ID }
  )

  // 세션별 성적 조회를 병렬화한다. 한 세션이 실패해도 전체가 중단되지 않도록
  // 개별 오류는 Sentry에 보고하고 빈 배열로 대체한다.
  const payloadsPerSession = await mapWithConcurrency(
    examSchedules,
    EXAM_FETCH_CONCURRENCY,
    async (examSchedule) => {
      try {
        return await esisV2.get<ResponseData<ExamCandidateGradeV2[]>>(
          `/svc/api/hub/v2/service/exam/candidate/grades/${groupId}/${examSchedule.testComponentSessionId}`,
          { institutionId: SCHOOL_ID }
        )
      } catch (error) {
        Sentry.captureException(error, {
          level: 'warning',
          tags: { feature: 'fetch-test-data', operation: 'fetch-session' },
          extra: {
            groupId,
            sessionId: examSchedule.testComponentSessionId
          }
        })
        return [] as ExamCandidateGradeV2[]
      }
    }
  )

  const studentExamData: Omit<Prisma.ExamCreateManyInput, 'id'>[] = []

  for (const examPayloads of payloadsPerSession) {
    for (const examData of examPayloads) {
      studentExamData.push({
        academicLevel: examData.academicLevel,
        grade: examData.gradeLevel,
        name: examData.examName,
        point: examData.percentage,
        status: examData.approvalStatusCode as GradeStatusType,
        systemId: String(examData.personId),
        // v2에는 후보자별 고유 ID가 없으므로 세션ID+개인ID로 합성한다.
        testId: `${examData.testComponentSessionId}_${examData.personId}`,
        type: examData.examType
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
    const existingTestIds = new Set(originData.map((exam) => exam.testId))

    // testId는 unique 제약이므로, DB에 이미 있는 건과 배치 내부 중복을 모두
    // 걸러낸다. 중복이 하나라도 남으면 createMany가 통째로 롤백된다.
    const seenTestIds = new Set<string>()
    const newExams = studentExams.filter((exam) => {
      if (existingTestIds.has(exam.testId) || seenTestIds.has(exam.testId)) {
        return false
      }
      seenTestIds.add(exam.testId)
      return true
    })

    if (newExams.length === 0) return 0

    // 동시 실행 등으로 그 사이 같은 testId가 들어와도 배치 전체가 실패하지
    // 않도록 skipDuplicates로 방어한다.
    const data = await prisma.exam.createMany({
      data: newExams,
      skipDuplicates: true
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
  try {
    const groupStudents = await esis.get<ResponseData<GroupStudent[]>>(
      `/svc/api/hub/group/student/list/${groupId}`,
      { cache: 'force-cache' }
    )

    // ESIS가 RESULT를 누락한 응답(세션 만료, 권한 없는 groupId 등)을 200으로
    // 내려주면 groupStudents가 undefined가 될 수 있다. .find() 호출 전 방어.
    if (!Array.isArray(groupStudents)) {
      Sentry.captureMessage('ESIS group student list returned no array', {
        level: 'warning',
        tags: { feature: 'esis', operation: 'getUserInfoById' },
        extra: { groupId, systemId, received: typeof groupStudents }
      })
      return systemId ? undefined : []
    }

    if (systemId) {
      const student = groupStudents.find(
        (s) => String(s.PERSON_ID) === String(systemId)
      )
      return student
    }

    return groupStudents
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { feature: 'esis', operation: 'getUserInfoById' },
      extra: { groupId, systemId }
    })
    return systemId ? undefined : []
  }
}

// v2 프록시는 POST로 동작해 Next fetch 캐시(force-cache)가 듣지 않으므로
// unstable_cache로 함수 결과 자체를 강제 캐싱한다. registerNumber가 캐시 키에
// 포함된다. 불량/실패 응답은 throw해서 캐시에 박히지 않도록 하고(wrapper에서
// 처리), 'student-register-info' 태그로 무효화할 수 있다.
const getStudentInfoByRegisterNumberCached = unstable_cache(
  async (registerNumber: string): Promise<StudentRegisterV2 | undefined> => {
    const result = await esisV2.get<ResponseData<StudentRegisterV2[]>>(
      `/svc/api/hub/v2/student/${encodeURIComponent(registerNumber.toLocaleUpperCase())}`,
      { institutionId: SCHOOL_ID }
    )

    if (!Array.isArray(result) || result.length === 0) {
      return undefined
    }

    return result[0]
  },
  ['student-register-info'],
  { revalidate: 60 * 60 * 24 * 7, tags: ['student-register-info'] }
)

/**
 * 등록번호(РД)로 학생 시스템 정보를 조회한다. (API-000144, ESIS v2)
 *
 * `getUserInfoById`는 groupId(classId) 기반이라 졸업해서 그룹에 속하지 않는
 * 학생은 조회가 불가능했다. 이 함수는 등록번호로 검색하므로 졸업생도
 * 시스템 정보를 가져올 수 있다. 결과는 unstable_cache로 강제 캐싱된다.
 */
export async function getStudentInfoByRegisterNumber(
  registerNumber: string
): Promise<StudentRegisterV2 | undefined> {
  // 등록번호(РД)는 항상 대문자로 정규화한다(키릴 대문자 + 숫자).
  const normalized = registerNumber.toUpperCase()
  try {
    return await getStudentInfoByRegisterNumberCached(normalized)
  } catch (error) {
    // 통신 실패/불량 응답 시 크래시 대신 undefined로 degrade.
    // throw는 캐시되지 않으므로 다음 요청에서 자동 재시도된다.
    Sentry.captureException(error, {
      level: 'warning',
      tags: { feature: 'esis', operation: 'getStudentInfoByRegisterNumber' },
      extra: { registerNumber: normalized }
    })
    return undefined
  }
}

export async function fetchStudentByRegisterNumber(registerNumber: string) {
  if (!esis.isReady()) {
    await connectEsis()
  }

  // 등록번호(РД)는 항상 대문자로 정규화한다(키릴 대문자 + 숫자).
  const normalized = registerNumber.toUpperCase()

  try {
    const response = await esis.get<ResponseData<Student[]>>(
      `/svc/api/hub/students/${normalized}`,
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
      extra: { registerNumber: normalized }
    })
    return null
  }
}

// 졸업생 정보(API-000249)도 v2 프록시(POST)라 Next fetch 캐시가 듣지 않아
// unstable_cache로 강제 캐싱한다. registerNumber가 캐시 키에 포함된다.
const getGraduateInfoByRegisterNumberCached = unstable_cache(
  async (
    registerNumber: string
  ): Promise<GraduateStudentInfoV2 | undefined> => {
    // 스펙상 username 쿼리가 required지만 실제로는 선택사항이라 생략한다.
    const result = await esisV2.get<ResponseData<GraduateStudentInfoV2[]>>(
      `/svc/api/hub/v2/student/graduate/info/${encodeURIComponent(registerNumber)}`
    )

    if (!Array.isArray(result) || result.length === 0) {
      return undefined
    }

    return result[0]
  },
  ['graduate-info'],
  { revalidate: 60 * 60 * 24 * 7, tags: ['graduate-info'] }
)

/**
 * 등록번호(РД)로 졸업생 정보를 조회한다. (API-000249, ESIS v2)
 *
 * 기본 학생 검색(`fetchStudentByRegisterNumber`)에서 찾지 못한 졸업생을
 * 조회하기 위한 폴백이다. 결과는 unstable_cache로 강제 캐싱된다.
 */
export async function getGraduateInfoByRegisterNumber(
  registerNumber: string
): Promise<GraduateStudentInfoV2 | undefined> {
  // 등록번호(РД)는 항상 대문자로 정규화한다(키릴 대문자 + 숫자).
  const normalized = registerNumber.toUpperCase()
  try {
    return await getGraduateInfoByRegisterNumberCached(normalized)
  } catch (error) {
    Sentry.captureException(error, {
      level: 'warning',
      tags: { feature: 'esis', operation: 'getGraduateInfoByRegisterNumber' },
      extra: { registerNumber: normalized }
    })
    return undefined
  }
}

/**
 * 성적 export 화면에서 다루는 학생 정보. 기본 검색 결과(`Student`)와 졸업생
 * 검색 결과(API-000249)를 모두 담을 수 있는 공통 형태. 졸업생 전용 필드
 * (conferAcademicYear/conferDate/degreeNidNumber)는 선택적으로 노출된다.
 */
export type ExportStudent = Pick<
  Student,
  | 'PERSON_ID'
  | 'FIRST_NAME'
  | 'LAST_NAME'
  | 'REGISTER'
  | 'ACADEMIC_YEAR'
  | 'ACADEMIC_LEVEL'
  | 'ACADEMIC_LEVEL_NAME'
  | 'INSTITUTION_NAME'
> & {
  FIRST_NAME_MGL?: string
  LAST_NAME_MGL?: string
  /** 졸업 학년도 (API-000249) */
  conferAcademicYear?: string
  /** 졸업 일자 (API-000249) */
  conferDate?: string
  /** 학위/졸업 증서 번호 (API-000249) */
  degreeNidNumber?: string
}
