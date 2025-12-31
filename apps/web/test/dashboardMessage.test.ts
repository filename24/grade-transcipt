import { makeDashboardMessage } from '../src/utils'
import {
  EXAM_DATE,
  FREE_LEARNING_WEEK,
  GRADUATION_DATE,
  SEMESTER_DATE
} from '../src/utils/constants'

describe('Dashboard message by date', () => {
  it('shows graduation message after graduation date', () => {
    // 졸업일 이후 1~30일 사이 랜덤 날짜
    const offset = Math.floor(Math.random() * 30 + 1)
    const now = new Date(
      GRADUATION_DATE.getTime() + 1000 * 60 * 60 * 24 * offset
    )
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime())
    const message = makeDashboardMessage(now)
    console.log(`[TEST] Date: ${now.toISOString()} | Message: ${message}`)
    expect(message).toMatch(/Амжилттай төгссөн/)
  })

  it('shows exam message during exam period', () => {
    // 시험기간 내 랜덤 날짜
    const examDays = Math.floor(
      (EXAM_DATE.END.getTime() - EXAM_DATE.START.getTime()) /
        (1000 * 60 * 60 * 24)
    )
    const offset = Math.floor(Math.random() * (examDays + 1))
    const now = new Date(
      EXAM_DATE.START.getTime() + 1000 * 60 * 60 * 24 * offset
    )
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime())
    const message = makeDashboardMessage(now)
    console.log(`[TEST] Date: ${now.toISOString()} | Message: ${message}`)
    expect(message).toMatch(/Улсын шалгалт/)
  })

  it('shows free learning week message during free learning week', () => {
    // 첫 번째 자율학습주 내 랜덤 날짜
    const weekDays = Math.floor(
      (FREE_LEARNING_WEEK[0].END.getTime() -
        FREE_LEARNING_WEEK[0].START.getTime()) /
        (1000 * 60 * 60 * 24)
    )
    const offset = Math.floor(Math.random() * (weekDays + 1))
    const now = new Date(
      FREE_LEARNING_WEEK[0].START.getTime() + 1000 * 60 * 60 * 24 * offset
    )
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime())
    const message = makeDashboardMessage(now)
    console.log(`[TEST] Date: ${now.toISOString()} | Message: ${message}`)
    expect(message).toMatch(/Бие даалтын долоо хоног/)
  })

  it('shows graduation soon message when graduation is near', () => {
    // 졸업 6~30일 전 랜덤 날짜 (시험기간 1~5일 전 제외)
    const offset = Math.floor(Math.random() * 25 + 6)
    const now = new Date(
      GRADUATION_DATE.getTime() - 1000 * 60 * 60 * 24 * offset
    )
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime())
    const message = makeDashboardMessage(now)
    console.log(`[TEST] Date: ${now.toISOString()} | Message: ${message}`)
    expect(message).toMatch(/Төгсөлт хүртэл/)
  })

  it('shows vacation message during vacation period', () => {
    // 1학기 방학기간 내 랜덤 날짜 (1학기 끝~2학기 시작 사이)
    const vacationStart = SEMESTER_DATE.HIGH[1].END.getTime()
    const vacationEnd = SEMESTER_DATE.HIGH[2].START.getTime()
    const vacationDays = Math.floor(
      (vacationEnd - vacationStart) / (1000 * 60 * 60 * 24)
    )
    // vacationStart < now < vacationEnd 이어야 하므로 offset은 1부터 vacationDays-1 까지
    const offset = Math.floor(Math.random() * (vacationDays - 1)) + 1
    const now = new Date(vacationStart + 1000 * 60 * 60 * 24 * offset)
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime())
    const message = makeDashboardMessage(now)
    console.log(`[TEST] Date: ${now.toISOString()} | Message: ${message}`)
    expect(message).toMatch(/амралт үргэлжилж байна/)
  })

  it('shows vacation message during 2nd semester vacation period', () => {
    // 2학기 방학기간 내 랜덤 날짜 (2학기 끝~3학기 시작 사이)
    const vacationStart = SEMESTER_DATE.HIGH[2].END.getTime()
    const vacationEnd = SEMESTER_DATE.HIGH[3].START.getTime()
    const vacationDays = Math.floor(
      (vacationEnd - vacationStart) / (1000 * 60 * 60 * 24)
    )
    const offset = Math.floor(Math.random() * (vacationDays - 1)) + 1
    const now = new Date(vacationStart + 1000 * 60 * 60 * 24 * offset)
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime())
    const message = makeDashboardMessage(now)
    console.log(`[TEST] Date: ${now.toISOString()} | Message: ${message}`)
    expect(message).toMatch(/амралт үргэлжилж байна/)
  })

  it('shows normal semester message during 1st semester', () => {
    // 1학기 내 랜덤 날짜 (자율학습주 피하기 위해 9월달로 제한)
    const start = SEMESTER_DATE.HIGH[1].START.getTime()
    const end = new Date('2025-09-30').getTime()
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24))
    const offset = Math.floor(Math.random() * (days + 1))
    const now = new Date(start + 1000 * 60 * 60 * 24 * offset)
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime())
    const message = makeDashboardMessage(now)
    console.log(
      `[TEST] [Semester 1] Date: ${now.toISOString()} | Message: ${message}`
    )
    expect(message).toMatch(/1-р улирал үргэлжилж байна/)
  })

  it('shows normal semester message during 2nd semester', () => {
    // 2학기 내 랜덤 날짜 (자율학습주 피하기 위해 2월달로 제한)
    const start = new Date('2026-02-01').getTime()
    const end = new Date('2026-02-28').getTime()
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24))
    const offset = Math.floor(Math.random() * (days + 1))
    const now = new Date(start + 1000 * 60 * 60 * 24 * offset)
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime())
    const message = makeDashboardMessage(now)
    console.log(
      `[TEST] [Semester 2] Date: ${now.toISOString()} | Message: ${message}`
    )
    expect(message).toMatch(/2-р улирал үргэлжилж байна/)
  })

  it('shows normal semester message during 3rd semester', () => {
    // 3학기 내 랜덤 날짜
    const start = SEMESTER_DATE.HIGH[3].START.getTime()
    const end = SEMESTER_DATE.HIGH[3].END.getTime()
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24))
    const offset = Math.floor(Math.random() * (days + 1))
    const now = new Date(start + 1000 * 60 * 60 * 24 * offset)
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime())
    const message = makeDashboardMessage(now)
    console.log(
      `[TEST] [Semester 3] Date: ${now.toISOString()} | Message: ${message}`
    )
    expect(message).toMatch(/3-р улирал үргэлжилж байна/)
  })
})
