/**
 * 0 - 1 semester
 * 1 - 2 semester
 */
export const CURRECT_SEMESTER = 0

export const SEMESTER_DATE = {
  ELEMENTARY: {
    1: {
      START: new Date('2025-09-01'),
      END: new Date('2025-12-15')
    },
    2: {
      START: new Date('2026-01-26'),
      END: new Date('2026-04-07')
    },
    3: {
      START: new Date('2026-04-14'),
      END: new Date('2026-06-09')
    }
  },
  MIDDLE: {
    1: {
      START: new Date('2025-09-01'),
      END: new Date('2025-12-22')
    },
    2: {
      START: new Date('2026-01-26'),
      END: new Date('2026-04-07')
    },
    3: {
      START: new Date('2026-04-14'),
      END: new Date('2026-06-16')
    }
  },
  HIGH: {
    1: {
      START: new Date('2025-09-01'),
      END: new Date('2026-12-22')
    },
    2: {
      START: new Date('2026-01-26'),
      END: new Date('2026-04-07')
    },
    3: {
      START: new Date('2026-04-14'),
      END: new Date('2026-06-13')
    }
  }
}

export const GRADUATION_DATE = SEMESTER_DATE.HIGH[3].END
export const ACADEMIC_YEAR = '2025' as const

/**
 * Class ID
 */
export const STUDENT_GROUP_ID = '100005190720739'
export const SCHOOL_ID = '40301'

export type SemesterLevel = 1 | 2 | 3
export type EducationLevel = keyof typeof SEMESTER_DATE

export const RedisKeys = {
  esisToken: 'gt.knea.esis.token'
} as const
export const CDN_ENDPOINT = 'https://cdn.flnm.dev/grade-transcript'
