/**
 * 시험 세션 정보를 나타내는 인터페이스
 */
export interface ExamSession {
  /**
   * 테스트 컴포넌트 세션의 고유 식별자
   * @type {number}
   */
  TEST_COMPONENT_SESSION_ID: number

  /**
   * 등급 체계 ID
   * @type {number}
   */
  GRADE_SCHEME_ID: number

  /**
   * 학년
   * @type {string}
   */
  ACADEMIC_LEVEL: string

  /**
   * 시험 이름 (기본 언어)
   * @type {string}
   */
  EXAM_NAME: string

  /**
   * 시험 이름 (몽골어)
   * @type {string}
   */
  EXAM_NAME_MGL: string

  /**
   * 시험 유형 (예: "Заавал"는 필수 시험을 의미)
   * @type {string}
   */
  EXAM_TYPE: string

  /**
   * 시험 시작 날짜 및 시간 (ISO 8601 형식)
   * @type {string}
   */
  BEGIN_DATE_TIME: string

  /**
   * 시험 종료 날짜 및 시간 (ISO 8601 형식)
   * @type {string}
   */
  END_DATE_TIME: string

  /**
   * 최대 점수
   * @type {number}
   */
  MAX_SCORE: number

  /**
   * 행 번호
   * @type {number}
   */
  ROWNO: number
}

/**
 * 시험 후보자 컴포넌트 정보를 나타내는 인터페이스
 */
export interface StudentExamPayload {
  /**
   * 테스트 후보자 컴포넌트의 고유 식별자
   * @type {number}
   */
  TEST_CAND_COMPONENT_ID: number

  /**
   * 시험 이름 (기본 언어)
   * @type {string}
   */
  EXAM_NAME: string

  /**
   * 시험 유형 (예: "Заавал"는 필수 시험을 의미)
   * @type {string}
   */
  EXAM_TYPE: string

  /**
   * 학년 수준
   * @type {string}
   */
  ACADEMIC_LEVEL: string

  /**
   * 개인 식별자
   * @type {number}
   */
  PERSON_ID: number

  /**
   * 시험 점수
   * @type {number}
   */
  SCORE: number

  /**
   * 백분위 점수
   * @type {number}
   */
  PERCENTILE: number

  /**
   * 등급 식별자
   * @type {number}
   */
  GRADE_ID: number

  /**
   * 등급 코드 (예: "VII")
   * @type {string}
   */
  GRADE_CODE: string

  /**
   * 출석 사유 코드 (예: "CAME")
   * @type {string}
   */
  ATTENDANCE_REASON: string

  /**
   * 출석 사유 이름 (예: "Ирсэн"은 출석을 의미)
   * @type {string}
   */
  ATTENDANCE_REASON_NAME: string

  /**
   * 승인 상태 코드 (예: "APPROVED")
   * @type {string}
   */
  APPROVAL_STATUS: string

  /**
   * 승인 상태 이름 (예: "Батлагдсан"은 승인됨을 의미)
   * @type {string}
   */
  APPROVAL_STATUS_NAME: string
}

/**
 * ESIS v2 시험 세션 정보 (camelCase). v2 응답은 institutionId 쿼리가 필수다.
 */
export interface ExamSessionV2 {
  /**
   * 테스트 컴포넌트 세션의 고유 식별자
   */
  testComponentSessionId: number
  /**
   * 등급 체계 ID
   */
  gradeSchemeId: number
  /**
   * 학년
   */
  academicLevel: string
  /**
   * 시험 이름 (키릴)
   */
  examName: string
  /**
   * 시험 이름 (전통 몽골 문자)
   */
  examNameMgl: string
  /**
   * 시험 유형 (예: "Заавал"는 필수)
   */
  examType: string
  /**
   * 시험 시작 일시 (예: "2026-06-05 08:00:00")
   */
  beginDateTime: string
  /**
   * 시험 종료 일시
   */
  endDateTime: string
  /**
   * 최대 점수
   */
  maxScore: number
  /**
   * 행 번호
   */
  rowNo: number
}

/**
 * ESIS v2 시험 후보자 성적 (camelCase).
 *
 * v1과 달리 후보자별 고유 컴포넌트 ID(TEST_CAND_COMPONENT_ID)가 없으므로,
 * 한 학생의 한 시험 결과는 `testComponentSessionId` + `personId` 조합으로
 * 식별해야 한다.
 */
export interface ExamCandidateGradeV2 {
  /**
   * 테스트 컴포넌트 세션 ID
   */
  testComponentSessionId: number
  /**
   * 시험 ID
   */
  examId: number
  /**
   * 시험 이름 (키릴)
   */
  examName: string
  /**
   * 시험 유형
   */
  examType: string
  /**
   * 학년
   */
  academicLevel: string
  /**
   * 학년 이름 (예: "12-р анги")
   */
  academicLevelName: string
  /**
   * 개인 식별자
   */
  personId: number
  /**
   * 시험 점수
   */
  score: number
  /**
   * 백분위 점수
   */
  percentage: number
  /**
   * 등급 ID
   */
  gradeId: number
  /**
   * 등급 (예: "VIII")
   */
  gradeLevel: string
  /**
   * 출석 사유 코드 (예: "CAME")
   */
  attendanceReasonCode: string
  /**
   * 출석 사유 이름
   */
  attendanceReasonName: string
  /**
   * 승인 상태 코드 (예: "APPROVED")
   */
  approvalStatusCode: string
  /**
   * 승인 상태 이름
   */
  approvalStatusName: string
}
