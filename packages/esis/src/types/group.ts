export interface Student {
  PERSON_ID: string
  FIRST_NAME: string
  LAST_NAME: string
  /**
   * @format ISO 8601
   */
  DATE_OF_BIRTH: string
  GENDER_CODE: 'F' | 'M'
  ACADEMIC_LEVEL: string
  ACADEMIC_LEVEL_NAME: string
  STUDENT_GROUP_ID: number
  STUDENT_GROUP_NAME: string
  PROGRAM_OF_STUDY_ID: number
  PROGRAM_PLAN_ID: number
  TEACHER_ID: number | null
  TEACHER_NAME: string | null
  PROGRAM_STAGE_ID: number
  MICROSOFT_EMAIL: string
  MICROSOFT_PASSWORD: string
  GOOGLE_EMAIL: string
  GOOGLE_PASSWORD: string
  /**
   * @format ISO 8601
   */
  ACTION_DATE: string
  ACADEMIC_YEAR: string
  CIVIL_ID: number
  INSTITUTION_ID: number
  REGISTER: string
  FIRST_NAME_MGL: string
  LAST_NAME_MGL: string
  FAMILY_NAME_MGL: string
}
