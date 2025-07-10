import { getStudentGradeRecords } from '@/utils/fetch'
import { auth } from '@/utils/auth'
import { redirect } from 'next/navigation'
import RecordLayout from './_Components/RecordLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Knea - Хувийн хэрэг',
  openGraph: {
    type: 'website',
    siteName: 'Knea - Хувийн хэрэг',
    title: 'Knea - Хувийн хэрэг',
    description: 'Сурагчын дүнгийн систем'
  }
}

export default async function RecordPage() {
  const session = await auth()

  if (!session?.user) return redirect('/login')

  const academicYears: AcademicYearData[] = []
  const studentRecords = await getStudentGradeRecords(session.user.systemId)

  studentRecords.map((data) => {
    if (
      data.academicYear &&
      !academicYears.some((year) => year.academicYear === data.academicYear)
    ) {
      academicYears.push({
        academicYear: data.academicYear,
        academicLevel: data.academicLevel,
        academicLevelName: `${data.academicLevel}-р анги`
      })
    }
  })
  return (
    <RecordLayout academicYears={academicYears} gradeRecords={studentRecords} />
  )
}

export interface AcademicYearData {
  /**
   * Start year
   * if academicYear 0 is all
   * @example academicYear:2022
   * 2022-2023 academic year
   */
  academicYear: string
  /**
   * Academic level
   * @example academicLevel: "10"
   */
  academicLevel: string
  /**
   * Academic level name
   * @example academicLevelName: "10-р анги"
   */
  academicLevelName: string
}
