# ESIS v2 중고등교육 API 문서

> 몽골 교육부 ESIS(Боловсролын удирдлагын мэдээллийн систем) v2의 **중고등교육(일반교육) 시스템** = `Сургууль, цэцэрлэгийн систем`(유치원·초·중·고) API만 정리한 개발자 문서입니다.
> 작성 기준: developer v2 포털 서비스 카탈로그 분석. 이 영역 외(급식·전자학습·자격등급·공개 서비스 등)는 본 문서 범위에서 제외합니다.

## 1. 개요

- **대상 시스템**: `Сургууль, цэцэрлэгийн систем` (중고등교육 / 일반교육). 기관·교직원·학급·학생·출결·성적·시험·진급·졸업·예산·보건 등 학교 운영 전반을 포괄하는 v2의 핵심 영역입니다. **총 155개 서비스.**
- **호스트 이전**: 기존 v1은 `https://hub.esis.edu.mn`, v2는 **`https://hubv2.esis.edu.mn`** 를 사용합니다. v2 서비스 경로는 `/svc/api/hub/v2/...` 형태가 기본입니다.
- **점진적 이전 / 버전 공존**: 일부 서비스는 v1에서 더 이상 동작하지 않고 v2로만 제공됩니다. 동일 기능이 `…_V2`, `…_V3` 처럼 여러 버전으로 동시에 존재할 수 있으며, 신규 연동은 가장 높은 버전을 사용합니다 (예: 출결 저장이 2.0 / 3.0 두 가지로 제공되며 3.0은 "결석 추가 사유"를 지원).

## 2. 인증 및 요청 모델

> 실제 연동 코드는 `packages/esis`의 SDK(`ESISClient`)를 사용하세요. SDK 베이스 URL을 v2 호스트(`https://hubv2.esis.edu.mn`)로 맞춰야 v2 서비스를 호출할 수 있습니다.

1. **로그인 → 토큰 발급**: 사용자명/비밀번호로 인증하면 JWT 형식의 토큰을 받습니다. 이후 모든 서비스 호출은 이 토큰을 `Authorization: Bearer <token>` 헤더로 전달합니다.
2. **토큰 캐싱**: 토큰은 만료(exp) 전까지 재사용합니다. 본 프로젝트는 Redis에 토큰을 7일간 캐싱합니다. 토큰이 무효(401)면 재발급합니다.
3. **요청 본문**: 쓰기(POST) 작업은 JSON 본문으로 전달합니다. **모든 파라미터는 문자열(String) 타입으로 보내는 것을 원칙**으로 합니다(숫자/날짜 포함).
4. **GET 파라미터 전달 위치**: 조회(GET) 서비스의 입력은 **경로 파라미터**(`/.../:studentGroupId`)와 **쿼리 파라미터**(`?institutionId=...`)로 섞여 전달됩니다. 각 엔드포인트 경로의 `:이름` / `?이름=` 표기를 확인하세요.

## 3. 공통 규약 (Conventions)

### 3.1 응답 봉투(Envelope)

대부분의 서비스는 일관된 봉투 구조로 응답합니다.

```jsonc
{
  "SUCCESS_CODE": 200,            // 성공 코드 (200이면 정상)
  "RESPONSE_MESSAGE": "амжилттай", // 처리 메시지 ("성공")
  "RESULT": [ /* 실제 데이터(배열 또는 객체) */ ]
}
```

- SDK(`ESISClient`)는 성공 시 `RESULT`만 반환하도록 래핑합니다.
- 저장/배치 작업은 `RESULT` 대신(또는 추가로) 행 단위 처리 결과를 돌려주는 경우가 많습니다: `personId` + `status/outStatus/outputStatus` + `message/outMessage/statusMessage` 형태.

### 3.2 핵심 식별자 (거의 모든 서비스의 공통 입력)

| 식별자 | 의미 | 비고 |
|---|---|---|
| `institutionId` | 기관(학교/유치원) 번호 | 가장 빈번한 필수 입력. 거의 모든 호출의 스코프 |
| `personId` | 교육 분야 인물 등록 번호 | 학생·교직원 공통 인물 키 |
| `studentGroupId` | 학급(반/그룹) 번호 | 학급 단위 조회·저장 |
| `academicYear` | 학년도 | 연도 스코프 |
| `academicLevel` | 학년(차수) | |
| `programOfStudyId` / `programStageId` / `programPlanId` / `programElementId` | 교육과정 계층(프로그램→단계→계획→요소) | 과정·과목·성적 연결 키 |
| `subjectAreaId` | 교과(판단 영역) 번호 | |
| `courseId` | 차시/과목 번호 | |
| `personRegNumber` / `civilId` | 주민등록번호 / 시민 ID | 인물 검색 키 |

> **참고 (이 프로젝트와의 연결)**: 본 앱은 `User`와 `Grade`/`Exam`을 `systemId`로 연결합니다. ESIS 측 `personId`/`institutionId` 스코프와 혼동하지 마세요.

### 3.3 이벤트 기반 CRUD 패턴

쓰기 서비스 상당수가 단일 엔드포인트에서 `event` 값으로 동작을 분기합니다.

- 자주 쓰는 값: `CREATE`(생성/저장), `UPDATE`(수정), `DELETE`(삭제)
- 변형: `SAVE`/`DELETE`, `ADD`/`DELETE` 등도 존재 (서비스별 설명 확인 필요)

### 3.4 조회/저장 쌍(Pair) · 배치 패턴

대부분의 엔티티는 **조회(GET, `… харах/лавлах/жагсаалт`)** 와 **저장(POST, `… хадгалах`)** 가 짝을 이룹니다. 저장은 단건이 아니라 `studentList`, `measurements` 같은 **배열을 받아 배치 처리**하는 경우가 많습니다.

### 3.5 룩업(LookUp)

코드성 필드는 룩업 메타로 식별됩니다. 예: 출결 사유(`ATTEND_REASON_CODE`), 진급 동작(`PROGRESSION_ACTION_ID`), 졸업 상태(`GRADUATION_STATUS`), 학급 유형(`GROUP_TYPE_CODE`) 등. 코드 값은 하드코딩하지 말고 룩업/공통정보 서비스로 조회해 사용하세요.

---

## 4. 서비스 목록 (중고등교육 시스템)

> "엔드포인트"는 v2 호스트(`https://hubv2.esis.edu.mn`) 기준 **경로**입니다. `:이름`은 경로 파라미터, `?이름=`은 쿼리 파라미터입니다.
> "핵심 입력"은 입력 파라미터 앞부분, "주요 출력 필드"는 응답 데이터 필드 앞부분만 발췌한 것입니다(전체는 포털 원문 참조).

> 대상 시스템: **Сургууль, цэцэрлэгийн систем** (중고등교육 — 유치원·초·중·고 일반교육)

서비스 수: **155개**

### Багшийн мэдээлэл

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Багшийн ерөнхий мэдээлэл | `GET /svc/api/hub/v2/teacher/profile/:personId?institutionId=:institutionId` | personId, institutionId | assignmentId, personId, institutionId, jobCode, jobName, totalWorkYears, educationSectorYears, professionalExperience 외 31 |
| Багшийн жагсаалт | `GET /svc/api/hub/v2/teacher/list?institutionId=:institutionId` | institutionId | institutionId, assignmentId, personId, civilId, displayName, familyName, firstName, lastName 외 20 |
| Багшийн заадаг хичээлийн жагсаалт | `GET /svc/api/hub/v2/teacher/course/subject/:personId?institutionId=:institutionId` | personId, institutionId | instructorCourseId, personId, institutionId, instructorId, subjectAreaId, subjectAreaName, courseId, courseName 외 4 |
| Багшийн заах аргын нэгдэл | `GET /svc/api/hub/v2/teacher/academic/org/:personId?institutionId=:institutionId` | personId, institutionId | personId, institutionId, jobCode, jobName, subjectDepartmentId, subjectDepartmentName |
| Байгууллагын багш эсэх шалгах | `GET /svc/api/hub/v2/teacher/check/:personId` | — | — |
| Байгууллагын багшийн шилжилт хөдөлгөөн | `GET /svc/api/hub/v2/teacher/movements/:beginDate?institutionId=:institutionId` | beginDate, institutionId | assignmentId, institutionId, personId, displayName, lastName, firstName, dateOfBirth, genderCode 외 13 |
| Сэдвийн сангийн жагсаалт | `GET /svc/api/hub/v2/teacher/topics/courses/:personId?institutionId=:institutionId` | personId, institutionId | courseId, courseName, topicToo, subTopicToo |
| Хичээлийн сэдвийн сангийн жагсаалт | `GET /svc/api/hub/v2/teacher/topics/courses/:courseId?institutionId=:institutionId` | courseId, institutionId | courseTopicId, parentCourseTopicId, courseTopicName, parentCourseTopicName |

### Байгууллагын мэдээлэл

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Байгууллагын ажилчдын жагсаалт | `GET /svc/api/hub/v2/school/staff?institutionId=:institutionId` | institutionId | assignmentId, personId, civilId, familyName, lastName, firstName, familyNameMgl, firstNameMgl 외 23 |
| Байгууллагын барилга байгууламжын жагсаалт | `GET /svc/api/hub/v2/building/list?institutionId=:institutionId` | institutionId | buildingId, buildingName, createdYear, buildingPurposeName, standardFlag, buildingPropertyType, buildingPropertyTypeName, normalCapacity 외 5 |
| Байгууллагын барилга байгууламжын өрөөний жагсаалт | `GET /svc/api/hub/v2/room/list?institutionId=:institutionId` | institutionId | facilityId, institutionId, buildingId, buildingPurposeCode, roomName, description, facilityTypeId, classRoomType 외 6 |
| Байгууллагын бүлгийн жагсаалт лавлах /Шинэ хичээлийн жилээр/ | `GET /svc/api/hub/v2/group/next/academicYear?institutionId=:institutionId` | institutionId | institutionId, academicLevel, academicLevelName, studentGroupId, studentGroupName, programOfStudyId, programOfStudyName, programStageId 외 16 |
| Байгууллагын бүлгийн мэдээлэл | `GET /svc/api/hub/v2/group/list?institutionId=:institutionId` | institutionId | institutionId, academicLevel, academicLevelName, studentGroupId, studentGroupName, programOfStudyId, programOfStudyName, programStageId 외 16 |
| Байгууллагын ерөнхий мэдээлэл | `GET /svc/api/hub/v2/organization/info?institutionId=:institutionId` | institutionId | institutionId, propertyTypeName, institutionName, shortName, longName, legalName, legalNameMgl, institutionTypeId 외 8 |
| Байгууллагын заах аргын нэгдэл | `GET /svc/api/hub/v2/academic/org?institutionId=:institutionId` | institutionId | institutionId, subjectDepartmentId, subjectDepartmentName, shortName, institutionTypeId, institutionTypeName, parentGroupId, parentGroupName 외 2 |
| Дотоод нэгж лавлах | `GET /svc/api/hub/v2/organization/internal-units/info?institutionId=:institutionId` | institutionId | institutionId, departmentList, departmentId, departmentName, departmentTypeId, departmentTypeName, managerPersonId, managerName 외 5 |
| Дотоод нэгж нэмэх, Дотоод нэгж засах, устгах | `POST /svc/api/hub/v2/organization/internal-units/save` | institutionId, departmentName, departmentTypeId, managerPersonId, managerAssignmentId, workBeginTime 외 3 | status, statusMessage |
| Судлагдахууны жагсаалт | `GET /svc/api/hub/v2/subject/area?institutionId=:institutionId` | institutionId | subjectAreaId, subjectAreaName, subjectAreaNameMgl |
| Сургалтын хөтөлбөр түвшингийн жагсаалт | `GET /svc/api/hub/v2/program/stage/list/:programOfStudyId?institutionId=:institutionId` | institutionId, programOfStudyId | institutionId, programStageId, programStageName, programOfStudyId, programOfStudyName, isGraduatingClass, academicLevel |
| Сургалтын хөтөлбөрийн жагсаалт | `GET /svc/api/hub/v2/program/list?institutionId=:institutionId` | institutionid | institutionId, programOfStudyId, programOfStudyName, programClassificationId, programClassficationName, educationLevelCode, educationLevelName |
| Сургалтын хөтөлбөрийн төлөвлөгөөний жагсаалт | `GET /svc/api/hub/v2/program/stage/plan/list/:programOfStudyId/:programStageId?institutionId=:institutionId` | programOfStudyId, programStageId, institutionId | institutionId, programPlanId, programPlanName, programStageId, programStageName, programOfStudyId, programOfStudyName, programPlanTypeCode 외 3 |
| Сургалтын хөтөлбөрийн хичээлийн жагсаалт | `GET /svc/api/hub/v2/program/stage/plan/course/list/:programOfStudyId/:programStageId/:programPlanId?institutionId=:institutionId` | institutionId, programOfStudyId, programStageId, programPlanId | courseId, courseName, enrollmentCategoryCode, enrollmentCategoryName, programElementId, programStageId, programPlanId, programOfStudyId 외 8 |
| Хичээл нэмэх, засах | `POST /svc/api/hub/v2/program/elective-course/add` | event, institutionId, programOfStudyId, academicLevel, subjectAreaId, courseId | — |
| Хичээлийн жил нэмэх | `POST /svc/api/hub/v2/academic-years/status-addition` | institutionId, academicYear | academicYear, currentAcademicYearFlag, openDate, closedDate, academicYearStatus |
| Хичээлийн жилийн хаалт нээлт лавлах | `GET /svc/api/hub/v2/academic/year/statuses?institutionId=:institutionId` | institutionId | academicYear, currentAcademicYearFlag, openDate, closedDate, academicYearStatus |
| Ээлжит хичээл нэмэх | `POST /svc/api/hub/v2/class/courses/list/save` | classList, classIdLms, className, institutionId, subjectAreaId, enrollmentCategory 외 6 | — |
| Ээлжит хичээлийн бүртгэл лавлах | `GET /svc/api/hub/v2/classes/:academicYear?institutionId=:institutionId` | academicYear, institutionId | requestId, classId, classIdLms, className, institutionId, subjectAreaId, enrollmentCategory, academicLevel 외 4 |

### Бүлгийн ирц

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Хүүхдийн ирц бүртгэлийн мэдээлэл харах | `GET /svc/api/hub/v2/student/attendance/school/:academicYear/:daydate` | academicYear, dayDate | dayDate, studentGroupId, programStageId, academicLevel, instructorId, studentGroupName, displayName |
| Хүүхэд өдрийн ирц хадгалах | `GET /svc/api/hub/v2/group/school/attendance/save` | — | — |
| Хүүхэд өдрийн ирц хадгалах /Хувилбар 2.0/ | `POST /svc/api/hub/v2/group/school/attendance/save/v2?institutionId=:institutionId` | institutionId, studentGroupId, dayDate, attendanceList, personId, attendanceReasonCode 외 1 | — |
| Хүүхэд өдрийн ирц хадгалах /Хувилбар 3.0/ - Ирцийн нэмэлт шалтгаантай | `POST /svc/api/hub/v2/group/school/attendance/save/v3` | institutionId, studentGroupId, dayDate, attendanceList, personId, attendReasonCode 외 2 | — |
| Хүүхэд өдрийн ирц харах | `GET /svc/api/hub/v2/group/list/attendance/:studentGroupId/:dayDate?institutionId=:institutionId` | studentGroupId, dayDate, institutionId | academicLevel, personId, dayDate, attendanceReasonCode, attendanceReasonName, tardyMinutes |
| Цахим сургалтын ирцийн мэдээлэл | `GET /svc/api/hub/v2/attendance/list/:academicYear/:studentGroupId/:sessionId?institutionId=:institutionId` | academicYear, studentGroupId, sessionId | courseName, eClassName, instructorName, phoneNumber, dayOfWeek, lastName, firstName, classAttendDate 외 14 |

### Бүлгийн мэдээлэл

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Бүлгийн суралцагчийн төлөвлөгөө засах | `POST /svc/api/hub/v2/studentplan/update` | studentGroupId | status, message |
| Анги бүлгийн багш тохируулах | `POST /svc/api/hub/v2/group/instructor/save` | event, institutionId, studentGroupId, instructorId, instructorRole | status, statusMessage |
| Анги бүлгийн мэдээлэл засах, устгах | `POST /svc/api/hub/v2/student/group/info/update` | event, institutionId, studentGroupId, studentGroupName, academicLevel, programOfStudyId 외 7 | — |
| Анги бүлгийн мэдээлэл нэмэх | `POST /svc/api/hub/v2/student/group/info/create` | event, institutionId, studentGroupName, academicLevel, programOfStudyId, programStageId 외 6 | — |

### Вакцины мэдээлэл

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Вакциний мэдээлэл | `GET /svc/api/hub/v2/vaccine/list?institutionId=institutionId` | institutionId | VACCINE_NAME, VACCINE_DOSE |
| Товлолт вакциний мэдээлэл | `GET /svc/api/hub/v2/vaccine/plan/:personId?institutionId=institutionId` | personId, institutionId | PERSON_ID, PHONE_NO, PLAN_DATE, PLAN_HOSPITAL_NAME, PLAN_OFFICE_NAME, STEP_AGE, STEP_NAME, STEP_NAME_ENG 외 5 |
| Хийлгэсэн вакциний мэдээлэл | `GET /svc/api/hub/v2/vaccine/history/:personId?institutionId=institutionId` | personId, institutionId | PERSON_ID, VACCINE_GROUP_TYPE, APPROVED_DATE, HOSPITAL_NAME, VACCINE_DOSE, SERIAL_NUMBER, VACCINE_NAME, STATUS 외 5 |

### Дэвшилт

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Дэвшилт баталгаажуулах | `POST /svc/api/hub/v2/stdnt/progression-completed/approve` | institutionId, studentGroupId | personId, personRegNumber, firstName, lastName, fullName, status, message |
| Дэвшилт баталгаажуулах хүсэлт илгээх | `POST /svc/api/hub/v2/stdnt/progression/request` | institutionId, studentGroupId | — |
| Дэвшилтийн бүртгэл лавлах | `GET /svc/api/hub/v2/stdnt/progression/info/:studentGroupId?institutionId=institutionId` | institutionId, studentGroupId | institutionId, studentGroupId, studentGroupName, personId, lastName, firstName, personRegNumber, progressionStudentGroupId 외 6 |
| Дэвшилтийн бүртгэл устгах | `POST /svc/api/hub/v2/student/progression/delete` | institutionId, studentGroupId, personId | — |
| Дэвшилтийн бүртгэл хадгалах | `POST /svc/api/hub/v2/stdnt/progression/save` | institutionId, studentGroupId, studentList, personId, progressionStudentGroupId, progressionProgramOfStudyId 외 6 | — |
| Дэвшилтийн бүртгэл хадгалах | `POST /svc/api/hub/v2/stdnt/progression-completed/save` | institutionId, studentGroupId, studentList, personId, progressionStudentGroupId, progressionProgramOfStudyId 외 4 | personId, status, message |
| Дэвшилтийн дүнгийн нэгтгэл лавлах | `GET /svc/api/hub/v2/stdnt/progression/grade/summary/info/:studentGroupId?institutionId=institutionId` | institutionId, studentGroupId | institutionId, studentGroupId, personId, displayName, personRegNumber, actionName, actionDate |
| Дэвшилтийн дүнгийн нэгтгэл устгах | `POST /svc/api/hub/v2/stdnt/completed/delete` | institutionId, studentGroupId, personId | — |
| Дэвшилтийн дүнгийн нэгтгэл хадгалах | `POST /svc/api/hub/v2/stdnt/completed/save` | institutionId, studentGroupId, studentList, personId, rowNumber | outData, rowNumber, personId, outStatus, outMessage |
| Үйлдлийн шалтгаан лавлах /LookUp/ | `GET /svc/api/hub/v2/lookup/action-reason/:actionId` | actionId | actionId, actionName, actionReasonId, actionReasonName |

### 기타

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Нийтлэг мэдээлэл | `GET /svc/api/public/lookUp/:lookupType` | — | — |
| Шалгуурын мэдээлэл шалгах | `GET /svc/api/hub/v2/organization/criteria/check/:academicYear/:checkListHdrId/:checkListTypeId?institutionId=:institutionId` | institutionId, academicYear, checkListHdrId, checkListTypeId | — |

### Суралцагчийн мэдээлэл

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Бүлгийн сурагчийн ерөнхий мэдээлэл дамжуулах сервис | `GET /svc/api/hub/v2/group/general/student/list/:studentGroupId?institutionId=:institutionId` | studentGroupId, institutionId | userRole, personId, personRegNumber, firstName, lastName, familyName, civilId, institutionId 외 13 |
| Бүлгийн суралцагчийн жагсаалт | `GET /svc/api/hub/v2/group/student/list/:studentGroupId?institutionId=:institutionId` | studentGroupId, institutionId | institutionId, civilId, personId, familyName, firstName, lastName, familyNameMgl, lastNameMgl 외 25 |
| Сурагчдын холбоо барих мэдээлэл лавлах | `POST /svc/api/hub/v2/student/contacts?institutionId=:institutionId` | — | — |
| Сурагчийн ерөнхий мэдээлэл | `GET https://hubv2.esis.edu.mn/svc/api/hub/v2/student/info/:personRegNumber` | personRegNumber | userRole, personId, personRegNumber, firstName, lastName, familyName, civilId, institutionId 외 13 |
| Суралцагчдын сонгон судлах хичээлийн сургалтын хэлбэр лавлах | `GET https://hubv2.esis.edu.mn/svc/api/hub/v2/student/online/course/:courseId?institutionId=:institutionId` | institutionId, courseId | institutionId, courseId, subjectAreaId, subjectAreaName, countStudent, learningModeCode, learningModeName |
| Суралцагчийн бүртгэлтэй эсэх шалгах | `GET /svc/api/hub/v2/student/check/:personId?institutionId=:institutionId` | personId, institutionId | SUCCESS_CODE, RESPONSE_MESSAGE, RESULT |
| Суралцагчийн жагсаалт | `GET /svc/api/hub/v2/students/list?institutionId=:institutionId` | institutionId | institutionId, civilId, personId, familyName, firstName, familyNameMgl, lastNameMgl, firstNameMgl 외 25 |
| Суралцагчийн мэдээллийг РД-аар хайх | `GET /svc/api/hub/v2/student/:personRegNumber?institutionId=:institutionId` | personRegNumber | institutionId, personId, civilId, personRegNumber, familyName, firstName, lastName, familyNameMgl 외 18 |
| Суралцагчийн мэдээлэл хайх /УБЕГ -аас татаж шинэчлэх/ | `GET /svc/api/hub/v2/student/search/:civilId?institutionId=:institutionId` | civilId, institutionId | institutionId, personId, civilId, personRegNumber, familyName, lastName, firstName, firstNameMgl 외 18 |
| Суралцагчийн шилжилт хөдөлгөөний жагсаалт /Шинэчилсэн/ | `GET /svc/api/hub/v2/student/movement/v2/:beginDate?institutionId=:institutionId` | institutionId, beginDate | institutionId, studentProgramId, academicLevel, academicLevelName, studentGroupId, studentGroupName, programOfStudyId, programOfStudyName 외 16 |
| Суралцагчийн шилжилт хөдөлгөөний мэдээлэл | _(엔드포인트 미정/지원 종료)_ | — | — |
| Сурах бичгийн бүртгэл хадгалах | `POST /svc/api/hub/v2/textbook/save` | event, institutionId, personId, studentTextbookId, academicYear, textbookGroupId 외 7 | — |
| Сурах бичгийн бүртгэлийн жагсаалт | `GET /svc/api/hub/v2/student/profile/textbook/:personId/:educationLevelId?institutionId=:institutionId` | personId, educationLevelId, institutionId | studentTextbookId, ishas, textbookId, textbookName, textbookTypeId, textbookTypeName, textbookLevelId, textbookLevelName 외 8 |
| Сурах бичгийн төрлийн жагсаалт | `GET /svc/api/hub/v2/textbook/list?institutionId=:institutionId` | institutionId | textBookId, textBookGroupId, textBookLevelId, textbookTypeId, subjectAreaId, textbookName, textbookLanguage |

### Суралцагчийн нэмэлт мэдээлэл

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Суралцагчийн нэмэлт үндсэн мэдээлэл хадгалах сервис | `POST /svc/api/hub/v2/student/statistics/save` | event, institutionId, personId, motherLanguage, bloodType, orphanCategory 외 4 | — |
| Суралцагчийн үндсэн мэдээлэл | `GET /svc/api/hub/v2/student/statistics/info/:personId?institutionId=:institutionId` | personId, institutionId | PERSON_ID, INSTITUTION_ID, MOTHER_LANGUAGE, BLOOD_TYPE, STUDENT_ORPHAN_ID, ORPHAN_CATEGORY, GUARDIAN_TYPE, GUARDIAN_DESCRIPTION |
| Гэр бүлийн мэдээлэл хадгалах | `POST /svc/api/hub/v2/student/contacts/save` | institutionId, personId, p_rel_info_arr, event, institutionId, personId 외 88 | — |
| Гэр бүлийн мэдээлэл лавлах | `POST /svc/api/hub/v2/stdnt/all/contacts?institutionId=:institutionId` | institutionId, personId | relInfo, studentContactId, institutionId, personId, relationshipType, firstName, lastName, familyName 외 93 |
| Цол, шагнал, зэргийн мэдээлэл хадгалах | `POST /svc/api/hub/v2/stdnt/award/save?institutionId=:institutionId` | institutionId, event, personId, studentAwardId, awardGroupId, awardLevelId 외 11 | — |
| Цол, шагнал, зэргийн мэдээлэл лавлах | `GET /svc/api/hub/v2/stdnt/awards/:personId?institutionId=:institutionId` | personId, institutionId | studentAwardId, institutionId, personId, awardGroupId, awardLevelId, awardTypeId, awardId, awardName 외 14 |
| Дүрэмт хувцасны бүртгэл хадгалах, засах, устгах | `POST /svc/api/hub/v2/student/uniform/save` | event, institutionId, personId, studentUniformId, programOfStudyId, academicYear 외 5 | — |
| Дүрэмт хувцасны бүртгэлийн жагсаалт | `GET /svc/api/hub/v2/student/profile/stdntUniform/:personId/:catId?institutionId=:institutionId` | personId, catId, institutionId | studentUniformId, uniformCategoryId, uniformCategoryName, uniformTypeId, uniformTypeName, numberOfUniforms, academicYear, name 외 1 |
| Ном сурах бичгийн мэдээлэл хадгалах | `POST /svc/api/hub/v2/textbook/save` | event, institutionId, personId, studentTextbookId, academicYear, textbookGroupId 외 7 | — |
| Ном сурах бичгийн мэдээлэл | `GET /svc/api/hub/v2/student/textbook/:personId/:academicYear?institutionId=:institutionId` | personId, academicYear, institutionId | institutionId, personId, academicYear, textbookGroupId, textbookLevelId, textbookTypeId, subjectAreaId, textbookId 외 4 |
| Өрхийн мэдээлэл хадгалах | `POST /svc/api/hub/v2/stdnt/statistics/info/save?institutionId=:institutionId` | event, institutionId, personId, studentStatisticId, infoNumber5, infoFlag1 외 15 | — |
| Өрхийн мэдээлэл лавлах | `GET /svc/api/hub/v2/stdnt/statistics/info/:personId?institutionId=:institutionId` | personId, institutionId | studentStatisticsId, institutionId, personId, infoFlag1, infoFlag2, infoFlag3, infoFlag4, infoFlag5 외 12 |
| Амьдрах орчин хадгалах | `POST /svc/api/hub/v2/condition/save` | event, institutionId, personId, studentStatisticId, infoText1, infoText2 외 6 | — |
| Амьдрах орчин | `GET https://hubv2.esis.edu.mn/svc/api/hub/v2/student/live/condition/:personId?institutionId=:institutionId` | personId, institutionId | institutionId, personId, academicYear, studentLivingPalace, dormitoryPropertyType, dormitoryOwner, livingPlaceDistance, annualTuitionFee 외 4 |
| Дотуур байрны мэдээлэл хадгалах | `POST /svc/api/hub/v2/dormitory/save` | event, institutionId, personId, dormitoryRequestsId, academicYear, requestedDate 외 9 | — |
| Сурагчийн дотуур байрны мэдээлэл харах | `GET /svc/api/hub/v2/student/dormitory/:personId/:academicYear?institutionId=:institutionId` | personId, academicYear, institutionId | institutionId, personId, academicYear, requestedDate, registrationDate, registrationPerson, registrationPersonId, approvedBuildingId 외 6 |
| Сурдаггүй хүүхдийн мэдээлэл хадгалах | `POST https://hubv2.esis.edu.mn/svc/api/hub/v2/stdnt/outsideSchool/save?institutionId=:institutionId` | event, statisticInfo7Id, personId, academicYear, legislationCode, nidNumber 외 15 | — |
| Сурдаггүй хүүхдийн мэдээлэл лавлах | `GET https://hubv2.esis.edu.mn/svc/api/hub/v2/stdnt/outside/school/:registerNum?institutionId=:institutionId` | registerNum, institutionId | statisticInfo7Id, institutionId, academicYear, legislationCode, registerNum, nidType, personId, firstName 외 30 |
| Сургалтын нэмэлт мэдээлэл хадгалах | `POST /svc/api/hub/v2/stdnt/additional/save?institutionId=:institutionId` | institutionId, personId, academicYear, infoFlag1, infoFlag2 | — |
| Сургалтын нэмэлт мэдээлэл лавлах | `GET /svc/api/hub/v2/stdnt/additional/:personId/:academicYear?institutionId=:institutionId` | personId, academicYear, institutionId | studentAdditionalId, personId, institutionId, academicYear, infoFlag1, infoFlag2 |
| Эрүүл мэндийн осол гэмтэл харах | `GET /svc/api/hub/v2/student/incident/:personId?institutionId=:institutionId` | personId, institutionId | studentIncidentId, institutionId, personId, incidentType, incidentLocation, incidentDate, description |
| Эрүүл мэндийн мэс заслын мэдээлэл харах | `GET https://hubv2.esis.edu.mn/svc/api/hub/v2/student/surgery/:personId?institutionId=:institutionId` | personId, institutionId | institutionId, personId, surgeryName, hospitalName, surgeryDate, description, studentSurgeryId |
| Эрүүл мэндийн мэдээлэл үзлэг шинжилгээний мэдээлэл харах | `GET /svc/api/hub/v2/student/assessments/:personId?institutionId=:institutionId` | personId, institutionId | institutionId, personId, consultationType, consultationDate, nextConsultationDate, examinerOrganization, examinerPerson, consultationResult 외 12 |
| Эрүүл мэндийн мэдээлэл хөгжлийн бэрхшээлтэй сурагчийн мэдээлэл харах | `GET https://hubv2.esis.edu.mn/svc/api/hub/v2/student/disability/:personId?institutionId=:institutionId` | personId, institutionId | institutionId, personId, legislationCode, disabilityCategory, disabilityType, disabilityReason, disabilityDegree, disabilityQuotaFte 외 14 |
| Сурагчийн харшлын мэдээлэл харах | `GET https://hubv2.esis.edu.mn/svc/api/hub/v2/student/allergy/:personid?institutionId=:institutionId` | personId, institutionId | institutionId, personId, allergyType, allergyDate, description, studentAllergyId |
| Эрүүл мэндийн мэдээлэл хориотой хүнсний мэдээлэл харах | `GET https://hubv2.esis.edu.mn/svc/api/hub/v2/student/prohibited/:personId?institutionId=:institutionId` | personId, institutionId | studentProhibitedFoodId, institutionId, personId, prohibitedFood, description |
| Эрүүл мэндийн мэдээлэл өсөлт, хөгжлийн мэдээлэл харах | `GET /svc/api/hub/v2/student/measure/:personid?institutionId=:institutionId` | personId, institutionId | institutionId, personId, measurementDate, height, weight, weightIndex, studentMeasurementId, academicYear |
| Эрүүл мэндийн осол гэмтэл хадгалах | `POST /svc/api/hub/v2/student/incident/info/save` | event, institutionId, personId, incidentId, incidentType, incidentLocation 외 2 | — |
| Эрүүл мэндийн мэс заслын мэдээлэл хадгалах | `POST /svc/api/hub/v2/student/surgery/info/save` | event, institutionId, personId, surgeryId, surgeryName, hospitalName 외 2 | — |
| Эрүүл мэндийн мэдээлэл үзлэг шинжилгээ хадгалах | `POST /svc/api/hub/v2/student/assessments/info/save` | event, institutionId, personId, id, consultationType, consultationDate 외 9 | — |
| Эрүүл мэндийн мэдээлэл хөгжлийн бэрхшээл хадгалах | `POST /svc/api/hub/v2/student/disability/info/save` | event, institutionId, personId, disabilityId, disabilityLegislationCode, disabilityCategory 외 17 | — |
| Сурагчийн харшлын мэдээлэл хадгалах | `POST /svc/api/hub/v2/student/allergy/info/save` | event, institutionId, personId, allergyId, allergyType, allergyDate 외 1 | — |
| Эрүүл мэндийн мэдээлэл хориотой хүнс хадгалах | `POST /svc/api/hub/v2/student/prohibit/info/save` | event, institutionId, personId, prohibitedFoodId, prohibitedFood, prohibitedFoodDescription | — |
| Эрүүл мэндийн мэдээлэл өсөлт, хөгжлийн мэдээлэл хадгалах | `POST /svc/api/hub/v2/student/measure/info/save` | event, institutionId, personId, measurementId, measurementDate, height 외 1 | — |
| Эрүүл мэндийн үзлэг, шинжилгээ хавсралт файл | `POST https://hubv2.esis.edu.mn/svc/api/hub/v2/student/attachment/save` | event, institutionId, personId, studentAssessAttachmentId, studentAssessmentId, attachmentName 외 4 | — |
| Дүрэмт хувцасны бүртгэл хадгалах /Хувилбар 2.0/ | `POST /svc/api/hub/v2/student/uniform/bulk/save` | personId, institutionId, infoFlag3, event, uniforms, uniformCategoryId 외 3 | SUCCESS_CODE, RESPONSE_MESSAGE, RESULT, personId, responseStatus, responseInfo |
| Ном сурах бичгийн мэдээлэл хадгалах /Хувилбар 2.0/ | `POST https://hubv2.esis.edu.mn/svc/api/hub/v2/student/textbook/bulk/save` | event, institutionId, personId, textbooks, textbookGroupId, textbookLevelId 외 6 | SUCCESS_CODE, RESPONSE_MESSAGE, RESULT, personId, responseStatus, responseInfo |
| Суралцагчийн хэмжилтийн мэдээлэл лавлах сервис /Бүлгээр/ | `GET /svc/api/hub/v2/student/measurements/v2/:studentGroupId?institutionId=:institutionId` | studentGroupId, institutionId | institutionId, studentGroupId, personId, measurementDate, measurementFlag, reason, weight, height 외 2 |
| Суралцагчийн хэмжилтийн мэдээлэл хадгалах сервис /Бүлгээр/ | `POST /svc/api/hub/v2/student/measure/info/bulk/save` | institutionId, studentGroupId, measurements, personId, measurementDate, measurementFlag 외 5 | SUCCESS_CODE, RESPONSE_MESSAGE, RESULT |

### Сүү хөтөлбөр

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Сүү нийлүүлэгчийн мэдээлэл бүлгээр лавлах | `GET /svc/api/hub/v2/milk/provider/:studentGroupId?institutionId=:institutionId` | studentGroupId, institutionId | institutionId, studentGroupId, milkInstitutionRegNumber, milkInstitutionName, unitMetric, unitPrice |
| Сүү нийлүүлэгчийн мэдээлэл бүлгээр хадгалах | `POST /svc/api/hub/v2/milk/provider/save` | academicYear, institutionId, studentGroupList, studentGroupId, milkInstitutionRegNumber, unitMetric 외 1 | — |
| Сүү уух эсэх судалгаа лавлах | `GET /svc/api/hub/v2/milk/survey/:studentGroupId?institutionId=:institutionId` | studentGroupId, institutionId | institutionId, studentGroupId, personId, milkConsentFlag, milkReasonCode, milkReasonName, milkOtherReason, surveyDate |
| Сүү хөтөлбөрийн гүйцэтгэл лавлах | `GET /svc/api/hub/v2/milk/consumption/:studentGroupId/:dayDate?institutionId=:institutionId` | studentGroupId, dayDate, institutionId | personId, paymentSource, unitMetric, unitPrice, milkCompanyRegNumber |
| Сүү хөтөлбөрийн гүйцэтгэл хадгалах | `POST /svc/api/hub/v2/milk/consumption/save` | event, institutionId, studentGroupId, dayDate, paymentSource, studentList 외 4 | — |
| Сүүний асуумж хадгалах | `POST /svc/api/hub/v2/milk/survey/save` | institutionId, studentGroupId, studentList, personId, milkConsentFlag, milkReasonCode 외 2 | — |

### Төгсөлт

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Боловсролын баримт бичгийн мэдээлэл | `GET /svc/api/hub/v2/group/certificate/info/:studentGroupId?institutionId=institutionId` | institutionId, studentGroupId | institutionId, studentGroupId, personId, studentGraduationId, displayName, personRegNumber, degreeId, degreeName 외 5 |
| Боловсролын гэрчилгээний үнэт цаас суралцагчид хуваарилах | `POST /svc/api/hub/v2/offer/save` | institutionId, studentGroupId, studentList, personId, certificatePaperNumber, grantType | outData, personId, outputStatus, outputInfo |
| Боловсролын ҮНЭТ ЦААСНЫ мэдээлэл лавлах /Бүлгээр/ | `GET /svc/api/hub/v2/service/offer/info/:studentGroupId?institutionId=:institutionId` | institutionId, studentGroupId | degreeId, degreeName, certificatePaperNumber, studentGroupId, personId, displayName, personRegNumber |
| Боловсролын ҮНЭТ ЦААСНЫ мэдээлэл лавлах /Сургуулиар/ | `GET /svc/api/hub/v2/certificate/info?institutionId=institutionId` | institutionId | degreeId, degreeName, certificatePaperNumber, degreeNumberStatus, institutionId, studentGroupId, personId, displayName 외 1 |
| Судлагдахууны бодолтод оролцох хичээл нэмэх | `POST /svc/api/hub/v2/subject/grade/course/add` | institutionId, programOfStudyId, programPlanId, subjectAreaId, enrollmentCategoryCode, gradingAggregationTypeCode | programPlanSubjectId |
| Судлагдахууны бодолтод оролцох хичээл хасах | `POST /svc/api/hub/v2/subject/grade/course/delete` | institutionId, programPlanSubjectId | — |
| Судлагдахууны бодолтод оролцох хичээлийн жагсаалт лавлах | `GET /svc/api/hub/v2/subject/grade/course/list/:programOfStudyId/:programPlanId?institutionId=:institutionId` | institutionId, programOfStudyId, programPlanId | programPlanSubjectId, subjectAreaId, subjectAreaName, enrollmentCategoryCode, enrollmentCategoryName, gradingAggregationTypeCode |
| Судлагдахууны дүн лавлах | `GET /svc/api/hub/v2/subject/grade/info/:programPlanSubjectId/:studentGroupId?institutionId=:institutionId` | institutionId, programPlanSubjectId, studentGroupId | personId, programPlanSubjectId, subjectAreaId, enrollmentCategoryCode, enrollmentCategoryName, academicYear, subjectGrade, gradeCode 외 5 |
| Судлагдахууны дүн устгах | `POST /svc/api/hub/v2/subject/grade/delete` | intitutionId, programPlanSubjectId, studentList, personId | personId, outStatus, outMessage |
| Судлагдахууны дүн хадгалах | `POST /svc/api/hub/v2/subject/grade/save` | institutionId, programPlanSubjectId, studentList, personId, subjectGrade, courseCompletedHours 외 2 | personId, outStatus, outMessage |
| Төгсөгчөөс элсэх бүртгэл баталгаажуулах / Менежер/ | `POST /svc/api/hub/v2/student/enrollment/graduation-approval` | institutionId, studentGroupId | outstatus, outMessage |
| Төгсөгчөөс элсэх бүртгэл устгах | `POST /svc/api/hub/v2/student/enrollment/delete` | institutionId, studentGroupId, personId | outputStatus, outputInfo |
| Төгсөгчөөс элсэх бүртгэл хадгалах, устгах | `POST /svc/api/hub/v2/student/enrollment/save` | institutionId, studentGroupId, event, studentList, personId, actionId 외 2 | personId, outStatus, outMessage |
| Төгсөгчөөс элсэх бүртгэлийн төлөв | `GET /svc/api/hub/v2/student/enrollment/list/:studentGroupId?institutionId=institutionId` | institutionId, studentGroupId | studentGroupId, personId, displayName, personRegNumber, decisionNumber, graduationDecisionCode, graduationDecisionName, actionId 외 10 |
| Төгсөгчөөс элсэх хүсэлт цуцлах | `POST /svc/api/hub/v2/student/enrollment/request` | institutionId, studentGroupId, status | — |
| Төгсөлт баталгаажуулах хүсэлт | `POST /svc/api/hub/v2/stdnt/graduation/request` | institutionId, studentGroupId, graduationStudentList, personId, decisionNumber | — |
| Төгсөлт баталгаажуулах хүсэлт илгээх /Менежер/ | `POST /svc/api/hub/v2/stdnt/graduation/approval` | institutionId, studentGroupId, graduationStudentList, personId | personId, status, message |
| Төгсөлтийн бүртгэл устгах | `POST /svc/api/hub/v2/stdnt/graduation/delete` | institutionId, studentGroupId, personId | — |
| Төгсөлтийн бүртгэл хадгалах | `POST /svc/api/hub/v2/stdnt/graduation/save` | institutionId, studentGroupId, studentList, personId, graduationStatus, decisionNumber 외 1 | personId, personRegNumber, firstName, lastName, status, message |
| Төгсөлтийн бүртгэлийн төлөв | `GET /svc/api/hub/v2/student/graduation/list/:studentGroupId?institutionId=institutionId` | studentGroupId, institutionId | institutionId, studentGroupId, studentGroupName, personId, firstName, lastName, personRegNumber, decisionNumber 외 4 |
| Төгссөн сурагчийн мэдээлэл хайх /регистрийн дугаараар/ | `GET /svc/api/hub/v2/student/graduate/info/:personRegNumber` | personRegNumber, username | personId, lastName, firstName, familyName, dateOfBirth, genderName, personPhone, personAddress 외 8 |
| Хичээлийн жилийн хаалт, нээлт хийх буюу хадгалах | `POST /svc/api/hub/v2/academic-years/save` | institutionId | — |
| Хичээлийн жилийн хаалт, нээлтийн мэдээлэл лавлах | `GET /svc/api/hub/v2/academic-year/info?institutionId=:institutionId` | institutionId | institutionId, academicYear, currentAcademicYearFlag |
| Шалгуурын жагсаалт лавлах | `GET /svc/api/hub/v2/organization/criteria/list?institutionId=:institutionId` | institutionId | checklistHdrId, checklistTypeId, checklistTypeName, checklistDateTime, checklistStatusCode, checklistStatusName, errorCount |
| Шалгуурын мэдээлэл лавлах | `GET /svc/api/hub/v2/organization/criteria/info/:checklistHdrId?institutionId=:institutionId` | institutionId, checklistHdrId | checklistId, checklistTypeId, checklistTypeName, studentGroupName, personRegNumber, errorCount, recommendation |

### Төсөв хөрөнгө

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Төсөв орлого зарлагын маягтын мэдээлэл хадгалах | `GET /svc/api/hub/v2/execution/save` | — | — |
| Төсөв орлого зарлагын маягтын мэдээлэл хадгалах | `POST https://hubv2.esis.edu.mn/svc/api/hub/v2/execution/save` | institutionId, academicYear, username, inTotal, budgetTotal, executionTotal 외 1 | — |
| Төсөв орлого зарлагын маягтын мэдээлэл харах | `GET /svc/api/hub/v2/execution?institutionId=institutionId` | institutionId | SPECIFICATION_CODE, SPECIFICATION_NAME, BUDGET_TOTAL, EXECUTION_TOTAL, INSTITUTION_ID, ACADEMIC_YEAR, SEQUENCE, READ_ONLY_FLAG |
| Төсөв хөрөнгийн маягтын мэдээлэл хадгалах | `POST /svc/api/hub/v2/totalAssets/save` | institutionId, inAcademicYear, inStatisticList, specificationCode, firstBalance, additionBudget 외 8 | — |
| Төсөв хөрөнгийн маягтын мэдээлэл харах | `GET /svc/api/hub/v2/totalAssets?institutionId=institutionId` | institutionId | — |

### Үнэлгээ 2

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Үнэлгээ 2 -ын мэдээлэл лавлах /Суралцагчаар/ | `GET /svc/api/hub/v2/assessment/class/grade/personId/?institutionId=institutionId` | personId, institutionId | institutionId, institutionName, personId, lastName, firstName, subjectAreaId, subjectAreaName, academicLevel 외 11 |
| Үнэлгээ 2 устгах | `POST /svc/api/hub/v2/class/grade/delete` | institution_id, student_list, term_id, class_id, username | — |
| Үнэлгээ 2 хадгалах | `POST /svc/api/hub/v2/class/grade/save` | — | — |
| Үнэлгээ 2 хадгалах | `POST /svc/api/hub/v2/class/grade/save` | institutionId, studentList, personId, gradeMark, termId, classId | — |

### Хичээл

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Сургалтын төлөвлөгөөнд сонгон суралцах хичээл нэмэх | `POST /svc/api/hub/v2/program-plan/elective-course/actions` | event, institutionId, programOfStudyId, academicLevel, subjectAreaId, courseId 외 2 | programElementId |

### Хичээлийн дүн

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Жилийн эцсийн дүн хадгалах, устгах | `POST /svc/api/hub/v2/group/course/save` | institutionId, programElementId, studentGroupId, event, studentList, personId 외 6 | personId, outStatus, outMessage |
| Жилийн эцсийн дүн харах | `GET /svc/api/hub/v2/group/list/grade/:studentGroupId/:programElementId?institutionId=:institutionId` | studentGroupId, programElementId, institutionId | studentGroupId, personId, programElementId, courseGrade, gradeId, gradeLevelName, gradePoint, gradeOutcomeCode 외 3 |
| Жилийн эцсийн дүнгийн мэдээлэл лавлах /Суралцагчаар/ | `GET /svc/api/hub/v2/student/course/grade/:personId?institutionId=:institutionId` | personId, institutionId | institutionId, personId, institutionName, academicYear, academicLevel, subjectAreaId, subjectAreaCode, courseId 외 6 |
| Хичээлийн дүнгийн мэдээлэл /Дүнгийн схем/ | `GET /svc/api/hub/v2/scheme/grade/list/:gradingSchemeId?institutionId=:institutionId` | gradingSchemeId, institutionId | gradeId, minGrade, maxGrade, gradeLevel, gradePoints, gradeOutcomeCode |
| Шалгалтын дүн хадгалах | `POST /svc/api/hub/v2/exam/candidate/save` | institutionId, event, studentGroupId, testComponentSessionId, studentList, personId 외 4 | PERSON_ID, OUTPUT_STATUS, OUTPUT_INFO |

### Шалгалт

| 서비스 | 엔드포인트 | 핵심 입력 | 주요 출력 필드 |
|---|---|---|---|
| Шалгалт үүсгэх | `POST /svc/api/hub/v2/exam/creation` | institutionId, studentGroupId, programElementId | RESULT, testComponentSessionId, gradeSchemeId, academicLevel, examName, examNameMgl, examType, beginDateTime 외 3 |
| Шалгалтын дүн лавлах | `GET /svc/api/hub/v2/service/exam/candidate/grades/:studentGroupId/:testComponentSessionId?institutionId=:intitutionId` | studentGroupId, testComponentSessionId, InstitutionId | testComponentSessionId, examId, examName, examType, academicLevel, academicLevelName, personId, score 외 7 |
| Шалгалтын дүн хадгалах, устгах | `POST /svc/api/hub/v2/exam/candidate/save` | institutionId, event, studentGroupId, testComponentSessionId, studentList, personId 외 6 | personId, outStatus, outMessage |
| Шалгалтын жагсаалт харуулах | `GET /svc/api/hub/v2/service/exam/component/sessions/:studentGroupId?institutionId=:institutionId` | institutionId, studentGroupId | testComponentSessionId, gradeSchemeId, academicLevel, examName, examNameMgl, examType, beginDateTime, endDateTime 외 2 |

---

## 5. 핵심 데이터 모델 용어집

- **기관(institution)**: 학교/유치원 단위. 모든 운영 데이터의 최상위 스코프(`institutionId`).
- **인물(person)**: 학생·교직원을 아우르는 인물 레코드(`personId`). 주민번호(`personRegNumber`)·시민ID(`civilId`)로 검색.
- **교육과정 계층**: 프로그램(`programOfStudy`) → 단계(`programStage`) → 계획(`programPlan`) → 요소(`programElement`) → 과목(`subjectArea`/`course`). 성적·시험·진급이 이 계층에 매달립니다.
- **학급(studentGroup)**: 반 단위. 출결·성적·신체측정 등 대부분의 배치 작업 단위.
- **성적 체계**:
  - *Үнэлгээ 2 (평가 2)*: 형성/단원 평가 단위 성적.
  - *Жилийн эцсийн дүн (학년말 성적)*: 과목별 연말 확정 성적. 성적 스킴(`gradingScheme`: `gradeId`/`gradeLevel`/`gradePoint`/`gradeOutcome`)에 매핑.
  - *Шалгалт (시험)*: 시험 세션(`testComponentSession`) 생성 → 응시자 점수(`score`/`percentage`/`gradeId`) 저장.
- **진급/졸업(Дэвшилт/Төгсөлт)**: 신청 → 매니저 승인 → 확정 → (필요시) 삭제 워크플로. 동작/사유 코드(`actionId`/`actionReasonId`)와 승인상태(`approvalStatus`)로 추적.
- **학생 프로필 부가정보**: 가족/연락처, 포상, 교복, 교과서, 가구·주거 환경, 기숙사, 미취학 아동, 보건(부상·수술·검진·장애·알레르기·금지식품·성장측정) 등.

## 6. 대표 사용 흐름

1. **기관/학급 컨텍스트 확보**: `기관 일반정보` → `기관 학급 목록`으로 `institutionId`/`studentGroupId` 확보.
2. **학생 조회**: `학급 학생 목록` 또는 `주민번호로 학생 검색`으로 `personId` 확보.
3. **운영 데이터 처리**: 출결(2.0/3.0) · 성적(Үнэлгээ 2 / 학년말 / 시험) · 진급/졸업 워크플로 · 학생 프로필/보건 부가정보 저장·조회.
4. **검증/마감**: `학년도 개폐(хаалт/нээлт)`, `점검 기준(шалгуур)`으로 데이터 정합성 확인.

> 본 앱의 성적/시험 동기화는 이 영역의 조회 서비스(학년말 성적·시험 결과 등)를 v2 엔드포인트로 호출하도록 맞추면 됩니다.

## 7. 연동 시 권장 사항

- **버전 선택**: 같은 기능에 `_V2`/`_V3`가 있으면 최신 버전을 우선 사용합니다.
- **배치 처리 결과 검증**: 저장 서비스는 전체 성공/실패가 아니라 **행 단위 결과**(`personId`별 status/message)를 돌려줄 수 있으므로, 부분 실패를 반드시 검사하세요.
- **스코프 필수값**: `institutionId`(+상황에 따라 `academicYear`/`studentGroupId`)는 사실상 모든 호출의 전제입니다.
- **파라미터 위치 확인**: GET은 경로/쿼리 파라미터, POST는 JSON 본문. 엔드포인트의 `:param`/`?param=` 표기를 보고 매핑하세요.
- **코드값은 룩업으로**: 출결 사유·진급/졸업 동작·상태 코드 등은 룩업 서비스로 받아 사용합니다.
- **오류 보고**: ESIS 통신 실패는 프로젝트 정책에 따라 Sentry로 보고합니다(`tags: { feature }`, 사용자/요청 컨텍스트 첨부).
