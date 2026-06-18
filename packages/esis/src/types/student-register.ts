/**
 * API-000144 (HUB_SERVICE_SEARCH_STUDENT_REGISTER_V2) 응답 항목.
 *
 * `GET /svc/api/hub/v2/student/{personRegNumber}` 가 등록번호(РД)로 학생을
 * 검색해 반환한다. 그룹(bulkeg)에 소속되지 않은 졸업생도 조회 가능하다.
 */
export interface StudentRegisterV2 {
  /** Байгууллагын дугаар */
  institutionId: string
  /** 보육/교육 인적 등록번호 */
  personId: number
  /** 시민 등록번호 */
  civilId: number
  /** 등록번호(РД) */
  personRegNumber: string
  /** Ургийн овог */
  familyName: string
  /** Өөрийн нэр */
  firstName: string
  /** Эцэг эхийн нэр */
  lastName: string
  /** Ургийн овог /몽골 전통문자/ */
  familyNameMgl: string
  /** Өөрийн нэр /몽골 전통문자/ */
  firstNameMgl: string
  /** Эцэг/эх/ийн нэр /몽골 전통문자/ */
  lastNameMgl: string
  /** @format ISO 8601 */
  dateOfBirth: string
  /** Хүйсний код */
  genderCode: string
  /** Хүйсний нэр */
  genderName: string
  /** Анги */
  academicLevel: string
  /** Ангийн нэр */
  academicLevelName: string
  /** Бүлгийн дугаар */
  studentGroupId: number
  /** Бүлгийн нэр */
  studentGroupName: string
  /** Сургалтын хөтөлбөр дугаар */
  programOfStudyId: number
  /** Сургалтын хөтөлбөрийн нэр */
  programOfStudyName?: string
  /** Сургалтын төлөвлөгөөний дугаар */
  programPlanId: number
  /** Сургалтын төлөвлөгөөний нэр */
  programPlanName?: string
  /** MICROSOFT 메일 */
  microsoftEmail: string
  /** MICROSOFT 메일 비밀번호 */
  microsoftEmailPass: string
  /** GOOGLE 메일 */
  googleEmail: string
  /** GOOGLE 메일 비밀번호 */
  googleEmailPass: string
  /** Хичээлийн жил */
  academicYear: string
}

/**
 * API-000249 (HUB_SERVICE_FIND_STUDENT_REGISTER) 응답 항목.
 *
 * `GET /svc/api/hub/v2/student/graduate/info/{personRegNumber}` 가 등록번호(РД)로
 * **졸업생** 정보를 검색해 반환한다. 기본 학생 검색(`/svc/api/hub/students/...`)에서
 * 찾지 못한 졸업생을 조회하는 폴백 용도다. 쿼리 파라미터로 `username`이 필수.
 */
export interface GraduateStudentInfoV2 {
  /** 보육/교육 인적 등록번호 */
  personId: number
  /** Эцэг/эхийн нэр */
  lastName: string
  /** Өөрийн нэр */
  firstName: string
  /** Ургын овог */
  familyName: string
  /** @format date */
  dateOfBirth: string
  /** Хүйсийн нэр */
  genderName: string
  /** 인적 전화번호 */
  personPhone?: string
  /** 인적 주소 */
  personAddress?: string
  /** 졸업 학년도 (Төгссөн хичээлийн жил) */
  conferAcademicYear: string
  /** 졸업 일자 (Төгссөн огноо) @format date */
  conferDate: string
  /** 학위/졸업 증서 번호 (Баримт бичгийн дугаар) */
  degreeNidNumber: string
  /** 시민 등록번호 */
  civilId: number
  /** Байгууллагын дугаар */
  institutionId: number
  /** Байгууллагын нэр */
  institutionName: string
  /** 아이막/수도 이름 */
  institutionProvinceName?: string
  /** 솜/두렉 이름 */
  institutionSumDistrictName?: string
  /** 등록번호(РД) — 응답에 포함되지 않을 수 있음 */
  personRegNumber?: string
}
