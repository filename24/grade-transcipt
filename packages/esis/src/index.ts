import type { ESISClient } from './client/Client'

export type If<
  Value extends boolean,
  TrueResult,
  FalseResult = undefined
> = Value extends true
  ? TrueResult
  : Value extends false
    ? FalseResult
    : TrueResult | FalseResult

export interface HalfYearInfo {
  termId: string
  termName: string
  termSeq: string
}

export interface UserData {
  userId: string
  journalStatus: 'Y' | 'N'
  personId: string
  institutionId: string
  academicYear: string
  displayName: string
  orgType: string
  groupName: 'teacher' | 'manager'
  socialWorker: boolean
  userName: string
  token: string
}

export interface TokenData {
  userId: number
  personId: null
  legalEntityId: number
  /**
   * 진행중인 학교년도
   */
  academicYear: number
  displayName: null
  isEbsSub: number
  organizationName: string
  organizationProperty: number
  requestPermissionCode: 'Y' | 'N'
  username: string
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ResponseData<D = any> = {
  SUCCESS_CODE: number
  RESPONSE_MESSAGE: string
  RESULT: D
}

export interface CourseInfo {
  institutionId: string
  classId: string
  studentGroupId: string
  className: string
  /**
   * 담당 쌤
   */
  instructorName: string
  allStu: number | null // Explicitly allow null
  appProcent: string
  /**
   * 등록된 성적
   */
  stuApproved: number | null // Explicitly allow null
  stuApprovedAvg: string
  allCompletionPer: string
  allTopicPer: string
  /**
   * 심사중인 성적
   */
  stuPending: number | null // Explicitly allow null
  /**
   * 거부된 성적
   */
  stuRejected: number | null // Explicitly allow null
  /**
   * 새로 등록된
   */
  stuNew: number | null // Explicitly allow null
  journalAction: string | null // Explicitly allow null
  journalActionName: string
}

export interface StudentGrade {
  institutionId: string
  studentGroupId: string
  classId: string
  termId: string
  gradingSchemeId: string
  personId: string
  /**
   * 주민등록번호
   */
  primaryNidNumber: string
  displayName: string
  firstName: string
  lastName: string
  dateOfBirth: string
  studentGroupName: string
  className: string
  currentAcademicTermFlag: string
  mark1List: unknown | null //  Allowing any type or null since no structure is given
  studentClassGradeId: string
  /**
   * 점수
   */
  gradeMark: string
  gradeId: string
  /**
   * 등급
   */
  gradeCode: string
  gradePoints: string
  gradeOutcome: string
  /**
   * 상태
   */
  approvalStatus: GradeStatus
  approvalStatusName: string
}

export interface SubjectCourseData {
  // 기관 ID
  institutionId: number

  // 기관 이름, 예: 학교 이름 (문자열)
  organizationName: string

  // 학년도, 연도를 문자열로 저장 (예: "2023")
  academicYear: string

  // 학년 수준, 학년을 문자열로 표현 (예: "10")
  academicLevel: string

  // 과목 영역 ID, 과목을 구분하는 숫자 식별자
  subjectAreaId: number

  // 과목 영역 코드, 과목을 나타내는 짧은 코드 (예: "БНТ")
  subjectAreaCode: string

  // 강의 이름, 과목의 전체 이름 (예: "Биеийн тамир 10 (БНТ 1001) Заавал")
  courseName: string

  // 성적 점수, 소수점을 포함한 실수 (예: 97.7)
  gradeMark: number

  // 성적 등급 코드, 등급을 나타내는 문자열 (예: "VIII")
  gradeCode: string

  // 강의 분류, 필수/선택 여부를 나타내는 문자열 (예: "1")
  courseClassification: string

  // 강의 분류 이름, 분류의 설명 (예: "Заавал судлах хичээл")
  courseClassificationName: string

  // 평균 수업 시간, 주당 수업 시간을 숫자로 표현 (예: 2)
  avgContactHours: number
}

/**
 * NEW - 등록함
 * REJECTED - 취소함
 * PENDING - 심사받는중
 * APPROVED - 심사받음
 */
export type GradeStatusType = 'APPROVED' | 'PENDING' | 'REJECTED' | 'NEW'

export enum GradeStatus {
  APPROVED = 'Батлагдсан',
  PENDING = 'Хянагдаж байгаа',
  REJECTED = 'Цуцлагдсан',
  NEW = 'Бүртгэсэн'
}

export enum CourseCode {
  МХЛ = 'Монгол хэл',
  УЗО = 'Уран зохиол',
  МБЧ = 'Үндэсний бичиг',
  МАТ = 'Математик',
  БИО = 'Биологи',
  ФИЗ = 'Физик',
  ХИМ = 'Хими',
  ГЗЗ = 'Газар зүй',
  ЭМД = 'Эрүүн мэнд',
  БНТ = 'Биеийн тамир',
  АНГ = 'Англи хэл',
  МТХ = 'Монголын түүх',
  НСУ = 'Нийгэм судлал',
  МТИ = 'Мэдээлэл технологи',
  ИБЛ = 'Иргэний ёс зүй',
  ДЗЗ = 'Дизайн, зураг зүй, технологи',
  ТҮҮ = 'Түүх',

  ТХН = 'Технологи',
  ХӨГ = 'Хөгжим',
  ОРХ = 'Орос хэл',
  ЗРЗ = 'Зураг зүй',
  ДУГ = 'Дүрслэх урлаг',

  ХБН = 'Хүн ба нийгэм',
  ХББ = 'Хүн ба байгаль',
  ДУТ = 'Дүрслэх урлаг Технологи',
  ХГҮ = 'Хичээлээс гадуурх үйл ажиллагаа',
  АЧС = 'Амьдрах чадварт суралцах үйл ажиллагаа',
  ХБО = 'Хүн болон орчин',
  БЭХ = 'Бэлтгэл хичээл'
}

export interface ClientEventsTypes {
  ready: [client: ESISClient<true>]
  error: [error: Error]
  debug: [message: string]
}

export * from './client/Client'
export * from './utils/Constants'
