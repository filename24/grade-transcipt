import type { HttpStatusCode } from 'axios'

export interface FormattedData {
  /**
   * 수업 이름
   * @type {string}
   * @example "Математик"
   */
  lessonName: string

  /**
   * 교사 이름 (성의 첫 글자 대문자 + ". " + 이름)
   * @type {string}
   */
  teacherName: string

  teacherFirstName: string
  teacherLastName: string

  lastName: string
  firstName: string

  /**
   * 학생 등록 번호
   * @type {string}
   */
  registerNumber: string

  /**
   * 학년
   */
  grade: number

  /**
   * 학교 시스템 아이디
   */
  schoolId: string

  /**
   * 학년반
   */
  class: string | null
}

export type EECResponseData<T = unknown> = {
  code: HttpStatusCode
  status: string
  message: string
  result: T
}

/**
 * 수업 정보를 나타내는 인터페이스
 */
export interface Lesson {
  /**
   * 수업 이름 (예: "Математик")
   */
  name: string

  /**
   * 수업 유형 (예: "EBS")
   */
  type: string

  /**
   * 수업 코드 (예: "MATHEMATICS")
   */
  code: string

  /**
   * 수업 바코드 (예: 32)
   */
  barCode: number
}

/**
 * 교사 정보를 나타내는 인터페이스
 */
export interface Teacher {
  /**
   * 교사 ID (예: 185671)
   */
  id: number

  /**
   * 교사 역할 (예: "TEACHER")
   */
  role: string

  /**
   * 교사의 ESIS ID (예: "40301")
   */
  esisId: string

  /**
   * 성과 참여 여부 (예: 1)
   */
  performanceParticant: number

  /**
   * 성과 참여 수업 코드 (예: "MATHEMATICS")
   */
  performanceParticantLessonCode: string

  /**
   * 교사 이름 (예: "энхбаяр")
   */
  firstName: string

  /**
   * 교사 성 (예: "буянтогтох")
   */
  lastName: string

  /**
   * SOB 교사 유형 (빈 문자열일 수 있음)
   */
  sobTeacherType: string
}

/**
 * 학생 정보를 나타내는 인터페이스
 */
export interface Student {
  /**
   * 학생 ID (예: 6159539)
   */
  id: number

  /**
   * 학생의 ESIS ID (예: "40301")
   */
  esisId: string

  /**
   * 학년
   */
  grade: number

  /**
   * 등록 번호
   */
  regNo: string

  /**
   * 전화번호
   */
  phoneNumber: string

  /**
   * 클래스 ID
   */
  classId: number

  /**
   * 학생 이름
   */
  firstName: string

  /**
   * 학생 성
   */
  lastName: string

  /**
   * 클래스 정보
   */
  class: string | null
}

/**
 * 전체 데이터를 나타내는 최상위 인터페이스
 */
export interface AsuulgaData {
  /**
   * 레코드 ID
   */
  id: number

  /**
   * 교사 ID
   */
  teacherId: number

  /**
   * 샘플 생성 교사 그룹 ID (예: 0)
   */
  sampleGenTeacherGroupId: number

  /**
   * 생성 ID (예: 0)
   */
  genId: number

  /**
   * 수업 코드 (예: "MATHEMATICS")
   */
  lessonCode: string

  /**
   * 바코드
   */
  barCode: string

  /**
   * 학생 ID
   */
  studentId: number

  /**
   * 학년 (예: 11)
   */
  grade: number

  /**
   * ESIS ID
   */
  esisID: string

  /**
   * 그룹 번호
   */
  group: number

  /**
   * 학교 유형
   */
  schoolType: string

  /**
   * 학교 토폴로지
   */
  schoolTopology: string

  /**
   * 수업 정보 객체
   */
  lesson: Lesson

  /**
   * 교사 정보 객체
   */
  teacher: Teacher

  /**
   * 학생 정보 객체
   */
  student: Student
}

/**
 * API 응답 데이터를 나타내는 TypeScript 타입 정의
 * @interface LoginResponse
 */
export interface LoginResponse {
  /**
   * 응답 코드
   * @type {number}
   * @example 200
   */
  code: number

  /**
   * 응답 상태
   * @type {string}
   * @example "Амжилттай"
   */
  status: string

  /**
   * 응답 메시지
   * @type {string}
   * @example "Амжилттай"
   */
  message: string

  /**
   * 응답 결과 객체
   * @type {Result}
   */
  result: Result | null
}

/**
 * 응답 결과 데이터를 나타내는 인터페이스
 * @interface Result
 */
export interface Result {
  /**
   * JWT 토큰
   * @type {string}
   * @example ""
   */
  jwtToken: string
}
