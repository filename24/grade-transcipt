import { toSentenceCase } from "@/utils";
import axios, { HttpStatusCode } from "axios";

const registerNumbers = [
''
];

export async function GET(
  _request: Request,
) {

  const responseData: FormattedData[] = []

  for (let index = 0; index < registerNumbers.length; index++) {
    const registerNumber = registerNumbers[index];

    const loginData = await axios.post<LoginResponse>('https://asuulga-test-api.eec.mn/api/v1/login', {
      regNo: registerNumber,
      // 1: student, 2: parent
      type: 1
    })

    if (!loginData.data.result) {
      continue
    }

    const token = loginData.data.result.jwtToken
  
    const asuulgaData = await axios.get<ResponseData<AsuulgaData[]>>('https://asuulga-test-api.eec.mn/api/v1/survey/teacher?type=EBS', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    }).then((d) => d.data)

    asuulgaData.result.map(data => {
      console.log(data.student.firstName)
      responseData.push({
        lastName: toSentenceCase(data.student.lastName), 
        firstName: toSentenceCase(data.student.firstName),
        registerNumber: data.student.regNo,
        lessonName: data.lesson.name,
        teacherName: `${getFirstCharOfFirstWord(data.teacher.lastName).toUpperCase()}. ${toSentenceCase(data.teacher.firstName)}`,
      })
    })
  }

  return Response.json({
    status: 200,
    data: responseData
  })
}


interface FormattedData {
  /**
   * 수업 이름
   * @type {string}
   * @example "Математик"
   */
  lessonName: string;

  /**
   * 교사 이름 (성의 첫 글자 대문자 + ". " + 이름)
   * @type {string}
   */
  teacherName: string;

  lastName: string;
  firstName: string

  /**
   * 학생 등록 번호
   * @type {string}
   */
  registerNumber: string;
}

function getFirstCharOfFirstWord(str: string) {
  // 공백 제거 후 공백 기준으로 분리
  const words = str.trim().split(" ");
  // 첫 번째 단어가 있으면 첫 문자를 반환, 없으면 빈 문자열 반환
  return words.length > 0 && words[0].length > 0 ? words[0][0] : "";
}

type ResponseData<T = any> = {
  code: HttpStatusCode,
	status: string,
  message: string,
  result: T
}

/** 
 * 수업 정보를 나타내는 인터페이스
 */
interface Lesson {
  /** 
   * 수업 이름 (예: "Математик")
   */
  name: string;

  /** 
   * 수업 유형 (예: "EBS")
   */
  type: string;

  /** 
   * 수업 코드 (예: "MATHEMATICS")
   */
  code: string;

  /** 
   * 수업 바코드 (예: 32)
   */
  barCode: number;
}

/** 
 * 교사 정보를 나타내는 인터페이스
 */
interface Teacher {
  /** 
   * 교사 ID (예: 185671)
   */
  id: number;

  /** 
   * 교사 역할 (예: "TEACHER")
   */
  role: string;

  /** 
   * 교사의 ESIS ID (예: "40301")
   */
  esisId: string;

  /** 
   * 성과 참여 여부 (예: 1)
   */
  performanceParticant: number;

  /** 
   * 성과 참여 수업 코드 (예: "MATHEMATICS")
   */
  performanceParticantLessonCode: string;

  /** 
   * 교사 이름 (예: "энхбаяр")
   */
  firstName: string;

  /** 
   * 교사 성 (예: "буянтогтох")
   */
  lastName: string;

  /** 
   * SOB 교사 유형 (빈 문자열일 수 있음)
   */
  sobTeacherType: string;
}

/** 
 * 학생 정보를 나타내는 인터페이스
 */
interface Student {
  /** 
   * 학생 ID (예: 6159539)
   */
  id: number;

  /** 
   * 학생의 ESIS ID (예: "40301")
   */
  esisId: string;

  /** 
   * 학년 (예: 11)
   */
  grade: number;

  /** 
   * 등록 번호 (예: "УЛ08230451")
   */
  regNo: string;

  /** 
   * 전화번호 (예: "90704649")
   */
  phoneNumber: string;

  /** 
   * 클래스 ID (예: 237680887)
   */
  classId: number;

  /** 
   * 학생 이름 (예: "анхгэрэл")
   */
  firstName: string;

  /** 
   * 학생 성 (예: "амгалантамир")
   */
  lastName: string;

  /** 
   * 클래스 정보 (현재 null, 향후 확장 가능)
   */
  class: null | any;
}

/** 
 * 전체 데이터를 나타내는 최상위 인터페이스
 */
interface AsuulgaData {
  /** 
   * 레코드 ID (예: 2634837)
   */
  id: number;

  /** 
   * 교사 ID (예: 185671)
   */
  teacherId: number;

  /** 
   * 샘플 생성 교사 그룹 ID (예: 0)
   */
  sampleGenTeacherGroupId: number;

  /** 
   * 생성 ID (예: 0)
   */
  genId: number;

  /** 
   * 수업 코드 (예: "MATHEMATICS")
   */
  lessonCode: string;

  /** 
   * 바코드 (예: "11854016")
   */
  barCode: string;

  /** 
   * 학생 ID (예: 6159539)
   */
  studentId: number;

  /** 
   * 학년 (예: 11)
   */
  grade: number;

  /** 
   * ESIS ID (예: "40301")
   */
  esisID: string;

  /** 
   * 그룹 번호 (예: 1)
   */
  group: number;

  /** 
   * 학교 유형 (예: "EBS")
   */
  schoolType: string;

  /** 
   * 학교 토폴로지 (예: "NORMAL")
   */
  schoolTopology: string;

  /** 
   * 수업 정보 객체
   */
  lesson: Lesson;

  /** 
   * 교사 정보 객체
   */
  teacher: Teacher;

  /** 
   * 학생 정보 객체
   */
  student: Student;
}

/**
 * API 응답 데이터를 나타내는 TypeScript 타입 정의
 * @interface LoginResponse
 */
interface LoginResponse {
  /**
   * 응답 코드
   * @type {number}
   * @example 200
   */
  code: number;

  /**
   * 응답 상태
   * @type {string}
   * @example "Амжилттай"
   */
  status: string;

  /**
   * 응답 메시지
   * @type {string}
   * @example "Амжилттай"
   */
  message: string;

  /**
   * 응답 결과 객체
   * @type {Result}
   */
  result: Result | null;
}

/**
 * 응답 결과 데이터를 나타내는 인터페이스
 * @interface Result
 */
interface Result {
  /**
   * JWT 토큰
   * @type {string}
   * @example ""
   */
  jwtToken: string;
}