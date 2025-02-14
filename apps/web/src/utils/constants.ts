/**
 * 0 - 1 semester
 * 1 - 2 semester
 */
export const CURRECT_SEMESTER = 0

export const SEMESTER_DATE = {
  ELEMENTARY: {
    1: {
      START: new Date('2024-09-01'),
      END: new Date('2024-12-23')
    },
    2: {
      START: new Date('2025-01-24'),
      END: new Date('2025-04-07')
    },
    3: {
      START: new Date('2025-04-14'),
      END: new Date('2025-06-09')
    }
  },
  MIDDLE: {
    1: {
      START: new Date('2024-09-01'),
      END: new Date('2024-12-30')
    },
    2: {
      START: new Date('2025-01-24'),
      END: new Date('2025-04-07')
    },
    3: {
      START: new Date('2025-04-14'),
      END: new Date('2025-06-16')
    }
  },
  HIGH: {
    1: {
      START: new Date('2024-09-01'),
      END: new Date('2025-01-06')
    },
    2: {
      START: new Date('2025-01-24'),
      END: new Date('2025-04-07')
    },
    3: {
      START: new Date('2025-04-14'),
      END: new Date('2025-06-16')
    }
  }
}

export const GRADUATION_DATE = SEMESTER_DATE.HIGH[3].END

export type SemesterLevel = 1 | 2 | 3
export type EducationLevel = keyof typeof SEMESTER_DATE
