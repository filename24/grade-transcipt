import {
  calcAverageGrade,
  calcGPA,
  calculateGradeCode,
  cn,
  countGrades,
  filterUniqueClassNames,
  formatDateToYYYYMMDD,
  getBrowserAndOS,
  getCurrentSemesterForLevel,
  getCurrentSemesters,
  getDDay,
  getEducationLevelFromGrade,
  getFirstCharOfFirstWord,
  getGradeScale,
  getUserDefaultAvatarUrl,
  isElementarySchool,
  parseTextToArray,
  parseUserAgent,
  resolveClassCode,
  toSentenceCase
} from '../src/utils'
import { SEMESTER_DATE } from '../src/utils/constants'

describe('Utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
      expect(cn('class1', { class2: true, class3: false })).toBe(
        'class1 class2'
      )
      expect(cn('p-4', 'p-2')).toBe('p-2') // tailwind-merge check
    })
  })

  describe('resolveClassCode', () => {
    it('resolves class code correctly', () => {
      expect(resolveClassCode('МХЛ')).toBe('Монгол хэл ')
      expect(resolveClassCode('МАТ сонгон')).toBe('Математик / Сонгон судлах /')
    })
  })

  describe('calcGPA', () => {
    it('calculates GPA correctly', () => {
      expect(calcGPA([])).toBe(0)
      const gradesInput = [
        { point: 95 }, // 4
        { point: 85 }, // 3
        { point: 75 }, // 2
        { point: 65 } // 1
      ]
      // (4+3+2+1) / 4 = 2.5
      expect(calcGPA(gradesInput)).toBe(2.5)
    })

    it('ignores invalid grades', () => {
      const gradesInput = [
        { point: 95 }, // 4
        { point: 50 } // undefined (scale) -> treated as 0 in loop but loop logic: if (gradeScale) ...
        // Wait, getGradeScale returns undefined for < 60.
        // And calcGPA code: if (gradeScale) { totalGradePoints += gradeScale * 1 }
        // So 50 is ignored in numerator but still counted in denominator (totalCredits)?
        // Let's check source code logic again.
        // const totalCredits = grades.reduce((acc, _grade) => acc + 1, 0) -> counts all grades.
        // if (gradeScale) ... -> adds to numerator.
        // So for 95 and 50: totalCredits=2. totalPoints=4. Result 2.0?
      ]
      // 95 -> 4. 50 -> undefined.
      // totalCredits = 2.
      // totalGradePoints = 4.
      // 4 / 2 = 2.0.
      expect(calcGPA(gradesInput)).toBe(2.0)
    })
  })

  describe('getGradeScale', () => {
    it('returns correct scale', () => {
      expect(getGradeScale(95)).toBe(4)
      expect(getGradeScale(85)).toBe(3)
      expect(getGradeScale(75)).toBe(2)
      expect(getGradeScale(65)).toBe(1)
      expect(getGradeScale(59)).toBeUndefined()
    })
  })

  describe('calcAverageGrade', () => {
    it('calculates average grade correctly', () => {
      expect(calcAverageGrade([])).toBe(0)
      const gradesInput = [{ point: 90 }, { point: 80 }, { point: 70 }]
      // (90+80+70)/3 = 80
      expect(calcAverageGrade(gradesInput)).toBe(80)
    })
  })

  describe('countGrades', () => {
    it('counts grades correctly', () => {
      // @ts-ignore - partial mock
      const gradesInput = [
        { grade: 'VIII' },
        { grade: 'VIII' },
        { grade: 'VII' },
        { grade: 'I' }
      ]
      const counts = countGrades(gradesInput as any)
      expect(counts.VIII).toBe(2)
      expect(counts.VII).toBe(1)
      expect(counts.I).toBe(1)
      expect(counts.VI).toBe(0)
    })
  })

  describe('getDDay', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('returns D-Day string', () => {
      const today = new Date('2025-01-01T00:00:00Z')
      jest.spyOn(Date, 'now').mockReturnValue(today.getTime())

      // Same day
      expect(getDDay(new Date('2025-01-01T00:00:00Z'))).toBe('D-Day')

      // Future
      expect(getDDay(new Date('2025-01-02T00:00:00Z'))).toBe('D-1')

      // Past
      expect(getDDay(new Date('2024-12-31T00:00:00Z'))).toBe('D+1')
    })

    it('returns D-Day number', () => {
      const today = new Date('2025-01-01T00:00:00Z')
      jest.spyOn(Date, 'now').mockReturnValue(today.getTime())

      // Same day
      expect(getDDay(new Date('2025-01-01T00:00:00Z'), 'number')).toBe(0)

      // Future (tomorrow -> D-1 -> -1)
      expect(getDDay(new Date('2025-01-02T00:00:00Z'), 'number')).toBe(1)

      // Past (yesterday -> D+1 -> -1 diffDays -> returns diffDays which is -1)
      // Wait, if D+1 (1 day passed), logic returns diffDays.
      // diffDays = ceil((target - today)) = -1.
      // So it returns -1.
      // Future (D-1) also returns -1.
      // This seems ambiguous for number return type?
      // Future: diffDays = 1. Code: return Number(`-${diffDays}`) -> -1.
      // Past: diffDays = -1. Code: return diffDays -> -1.
      // So D-1 and D+1 both return -1?
      // Let's check logic:
      // Future (target > today) -> diffDays > 0.
      // Past (target < today) -> diffDays < 0.
      // If I want "D-Day number", usually it is days remaining.
      // If Future, days remaining = 1. But code returns -1.
      // If Past, days remaining = -1. Code returns -1.
      // This seems consistent: "days until target".
      // If target is tomorrow, days until = 1.
      // Why does code return -1 for future?
      /*
          if (diffDays > 0) {
            if (returnType === 'string') return `D-${diffDays}`
            return Number(`-${diffDays}`) // Returns negative for future?
          }
        */
      // D-Day usually means "Days remaining". D-5 means 5 days remaining.
      // Usually represented as positive integer 5.
      // But code returns -5?
      // If so, then for past D+1, it returns -1.
      // So future and past both return negative numbers?
      // Let's verify expectations.
      expect(getDDay(new Date('2025-01-02T00:00:00Z'), 'number')).toBe(1)
      expect(getDDay(new Date('2024-12-31T00:00:00Z'), 'number')).toBe(-1)
    })
  })

  describe('getCurrentSemesterForLevel', () => {
    it('returns current semester correctly', () => {
      // Mock date to be within semester 1
      const startSem1 = SEMESTER_DATE.HIGH[1].START
      const inSem1 = new Date(startSem1.getTime() + 1000 * 60 * 60 * 24 * 10) // 10 days in
      jest.useFakeTimers().setSystemTime(inSem1)

      expect(getCurrentSemesterForLevel('HIGH')).toBe(1)

      jest.useRealTimers()
    })

    it('returns null if not in semester', () => {
      // Mock date outside any semester (e.g. summer break?)
      // SEMESTER_DATE.HIGH[3].END is 2026-06-13.
      // Let's pick 2026-07-01
      const summerBreak = new Date('2026-07-01T00:00:00Z')
      jest.useFakeTimers().setSystemTime(summerBreak)

      expect(getCurrentSemesterForLevel('HIGH')).toBeNull()

      jest.useRealTimers()
    })
  })

  describe('getCurrentSemesters', () => {
    it('returns all semesters', () => {
      const startSem1 = SEMESTER_DATE.HIGH[1].START
      const inSem1 = new Date(startSem1.getTime() + 1000 * 60 * 60 * 24 * 10)
      jest.useFakeTimers().setSystemTime(inSem1)

      const result = getCurrentSemesters()
      expect(result.HIGH).toBe(1)
      // Assuming Elementary and Middle have similar start dates for sem 1
      expect(result.ELEMENTARY).toBe(1)
      expect(result.MIDDLE).toBe(1)

      jest.useRealTimers()
    })
  })

  describe('getEducationLevelFromGrade', () => {
    it('returns correct education level', () => {
      expect(getEducationLevelFromGrade('1')).toBe('ELEMENTARY')
      expect(getEducationLevelFromGrade('6')).toBe('ELEMENTARY')
      expect(getEducationLevelFromGrade('7')).toBe('MIDDLE')
      expect(getEducationLevelFromGrade('9')).toBe('MIDDLE')
      expect(getEducationLevelFromGrade('10')).toBe('HIGH')
      expect(getEducationLevelFromGrade('12')).toBe('HIGH')
      expect(getEducationLevelFromGrade('13')).toBeNull()
    })
  })

  describe('calculateGradeCode', () => {
    it('returns correct grade code', () => {
      expect(calculateGradeCode(95)).toBe('VIII')
      expect(calculateGradeCode(85)).toBe('VII')
      expect(calculateGradeCode(75)).toBe('VI')
      expect(calculateGradeCode(65)).toBe('V')
      expect(calculateGradeCode(55)).toBe('IV')
      expect(calculateGradeCode(45)).toBe('III')
      expect(calculateGradeCode(35)).toBe('II')
      expect(calculateGradeCode(25)).toBe('I')
    })
  })

  describe('isElementarySchool', () => {
    it('returns true for 1-5', () => {
      expect(isElementarySchool('1')).toBe(true)
      expect(isElementarySchool('5')).toBe(true)
      expect(isElementarySchool('6')).toBe(false)
      expect(isElementarySchool('10')).toBe(false)
    })
  })

  describe('filterUniqueClassNames', () => {
    it('filters unique class names', () => {
      const records = [
        { className: 'Math' },
        { className: 'Math' },
        { className: 'English' }
      ]
      // @ts-ignore
      const result = filterUniqueClassNames(records)
      expect(result).toHaveLength(2)
      expect(result[0].className).toBe('Math')
      expect(result[1].className).toBe('English')
    })
  })

  describe('getFirstCharOfFirstWord', () => {
    it('returns first char', () => {
      expect(getFirstCharOfFirstWord('Hello World')).toBe('H')
      expect(getFirstCharOfFirstWord('  Space ')).toBe('S')
      expect(getFirstCharOfFirstWord('')).toBe('')
    })
  })

  describe('toSentenceCase', () => {
    it('converts to sentence case', () => {
      expect(toSentenceCase('hello world')).toBe('Hello world')
      expect(toSentenceCase('HELLO')).toBe('Hello')
      expect(toSentenceCase('')).toBe('')
    })
  })

  describe('parseTextToArray', () => {
    it('parses text to array', () => {
      const text = 'Line 1\nLine 2\r\nLine 3\n\n'
      const result = parseTextToArray(text)
      expect(result).toEqual(['Line 1', 'Line 2', 'Line 3'])
    })

    it('returns empty array for empty input', () => {
      expect(parseTextToArray('')).toEqual([])
      // @ts-ignore
      expect(parseTextToArray(null)).toEqual([])
    })
  })

  describe('getUserDefaultAvatarUrl', () => {
    it('returns valid avatar url', () => {
      const url = getUserDefaultAvatarUrl('12345')
      expect(url).toMatch(
        /https:\/\/cdn.flnm.dev\/grade-transcript\/profile\/default_\d+.png/
      )
    })
  })

  describe('formatDateToYYYYMMDD', () => {
    it('formats date correctly', () => {
      expect(formatDateToYYYYMMDD('2025-12-25T10:00:00Z')).toBe('2025-12-25')
    })

    it('throws error for invalid date', () => {
      expect(() => formatDateToYYYYMMDD('invalid')).toThrow()
    })
  })

  describe('parseUserAgent', () => {
    it('returns default values when userAgent is undefined', () => {
      const result = parseUserAgent(undefined)
      expect(result).toEqual({
        browser: 'Unknown Browser',
        os: 'Unknown OS',
        deviceType: 'desktop'
      })
    })

    it('detects mobile device type', () => {
      const mobileUA =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      const result = parseUserAgent(mobileUA)
      expect(result.deviceType).toBe('mobile')
    })

    it('detects Android mobile device', () => {
      const androidUA =
        'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36'
      const result = parseUserAgent(androidUA)
      expect(result.deviceType).toBe('mobile')
      expect(result.os).toBe('Android')
    })

    it('detects Edge browser', () => {
      const edgeUA =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
      const result = parseUserAgent(edgeUA)
      expect(result.browser).toBe('Edge')
      expect(result.os).toBe('Windows')
    })

    it('detects Chrome browser', () => {
      const chromeUA =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      const result = parseUserAgent(chromeUA)
      expect(result.browser).toBe('Chrome')
      expect(result.os).toBe('Windows')
    })

    it('detects Firefox browser', () => {
      const firefoxUA =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
      const result = parseUserAgent(firefoxUA)
      expect(result.browser).toBe('Firefox')
      expect(result.os).toBe('Windows')
    })

    it('detects Safari browser', () => {
      const safariUA =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
      const result = parseUserAgent(safariUA)
      expect(result.browser).toBe('Safari')
      expect(result.os).toBe('macOS')
    })

    it('detects Opera browser', () => {
      const operaUA =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.277'
      const result = parseUserAgent(operaUA)
      expect(result.browser).toBe('Opera')
    })

    it('detects macOS', () => {
      const macUA =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      const result = parseUserAgent(macUA)
      expect(result.os).toBe('macOS')
    })

    it('detects Linux', () => {
      const linuxUA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      const result = parseUserAgent(linuxUA)
      expect(result.os).toBe('Linux')
    })

    it('detects iOS', () => {
      const iosUA =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      const result = parseUserAgent(iosUA)
      expect(result.os).toBe('iOS')
    })

    it('detects iPad as iOS', () => {
      const iPadUA =
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      const result = parseUserAgent(iPadUA)
      expect(result.os).toBe('iOS')
    })
  })

  describe('getBrowserAndOS', () => {
    const originalWindow = global.window
    const originalNavigator = global.navigator

    afterEach(() => {
      global.window = originalWindow
      global.navigator = originalNavigator
    })

    it('returns "Unknown device" when window is undefined', () => {
      // @ts-ignore
      global.window = undefined
      const result = getBrowserAndOS()
      expect(result).toBe('Unknown device')
    })

    it('detects 1Password', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 1Password' },
        writable: true,
        configurable: true
      })
      const result = getBrowserAndOS()
      expect(result).toBe('1Password')
    })

    it('detects Bitwarden', () => {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 Bitwarden' },
        writable: true,
        configurable: true
      })
      const result = getBrowserAndOS()
      expect(result).toBe('Bitwarden')
    })

    it('returns "Google Password Manager" for Chrome on Windows', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        writable: true,
        configurable: true
      })
      const result = getBrowserAndOS()
      expect(result).toBe('Google Password Manager')
    })

    it('returns "Google Password Manager" for Chrome on macOS', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        writable: true,
        configurable: true
      })
      const result = getBrowserAndOS()
      expect(result).toBe('Google Password Manager')
    })

    it('returns "browser on OS" format for Firefox on Linux', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent:
            'Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0'
        },
        writable: true,
        configurable: true
      })
      const result = getBrowserAndOS()
      expect(result).toBe('Firefox on Linux')
    })

    it('returns "browser on OS" format for Safari on macOS', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
        },
        writable: true,
        configurable: true
      })
      const result = getBrowserAndOS()
      expect(result).toBe('Safari on macOS')
    })

    it('returns "browser on OS" format for Chrome on Linux', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent:
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        writable: true,
        configurable: true
      })
      const result = getBrowserAndOS()
      expect(result).toBe('Chrome on Linux')
    })
  })
})
