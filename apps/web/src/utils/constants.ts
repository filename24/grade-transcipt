/**
 * 0 - 1 semester
 * 1 - 2 semester
 */
export const CURRECT_SEMESTER: 0 | 1 = 1

export const SEMESTER_DATE = {
  ELEMENTARY: {
    1: {
      START: new Date('2025-09-01'),
      END: new Date('2025-12-13')
    },
    2: {
      START: new Date('2026-01-26'),
      END: new Date('2026-04-04')
    },
    3: {
      START: new Date('2026-04-13'),
      END: new Date('2026-06-13')
    }
  },
  MIDDLE: {
    1: {
      START: new Date('2025-09-01'),
      END: new Date('2025-12-20')
    },
    2: {
      START: new Date('2026-01-26'),
      END: new Date('2026-04-04')
    },
    3: {
      START: new Date('2026-04-13'),
      END: new Date('2026-06-13')
    }
  },
  HIGH: {
    1: {
      START: new Date('2025-09-01'),
      END: new Date('2025-12-20')
    },
    2: {
      START: new Date('2026-01-26'),
      END: new Date('2026-04-04')
    },
    3: {
      START: new Date('2026-04-13'),
      END: new Date('2026-06-13')
    }
  }
}

export const FREE_LEARNING_WEEK = [
  {
    START: new Date('2025-10-20'),
    END: new Date('2025-10-26')
  },
  {
    START: new Date('2026-03-30'),
    END: new Date('2026-04-5')
  }
]

export const EXAM_DATE = {
  START: new Date('2026-06-05'),
  END: new Date('2026-06-12')
}

export const GRADUATION_DATE = SEMESTER_DATE.HIGH[3].END
export const CURRECT_ACADEMIC_YEAR = '2025' as const

/**
 * Class ID
 */
export const STUDENT_GROUP_ID = '100005190720739'
export const SCHOOL_ID = '40301'

/**
 * 졸업생 학년 (API-000249는 academicLevel을 제공하지 않음).
 * 몽골 бүрэн дунд(완전 중등) 졸업 = 12학년이므로 성적 학년 역산의 기준으로 쓴다.
 */
export const GRADUATE_ACADEMIC_LEVEL = '12'

export type SemesterLevel = 1 | 2 | 3
export type EducationLevel = keyof typeof SEMESTER_DATE

export const RedisKeys = {
  esisToken: 'gt.knea.esis.token'
} as const
export const CDN_ENDPOINT = 'https://cdn.flnm.dev/grade-transcript'
