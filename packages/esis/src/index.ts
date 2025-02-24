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

export type ResponseData<D = Record<string, string>> = {
  SUCCESS_CODE: string
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

export interface AcademicYearData {
  /**
   * Start year
   * if academicYear 0 is all
   * @example academicYear:2022
   * 2022-2023 academic year
   */
  academicYear: string
  academicLevel: string
  academicYearName: string
}

export interface SubjectCourseData {
  /**
   * 순번
   */
  rn: string
  /**
   * 학교명
   */
  organizationName: string
  /**
   * 학년
   */
  academicLevel: string
  /**
   * 과목코드
   */
  subjectAreaCode: string
  /**
   * 과목 이름
   */
  courseName: string
  /**
   * 점수
   */
  gradeMark: string
  /**
   * 등급
   */
  gradeCode: string
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

export * from './client/Client'
export * from './utils/Constants'
