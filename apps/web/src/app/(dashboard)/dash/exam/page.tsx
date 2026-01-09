import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { auth } from '@/utils/better-auth'
import { getStudentExams } from '@/utils/fetch'

import ExamLayout from './_Components/ExamLayout'
import type { ExamTableData } from './_Components/ExamTable'

export const metadata: Metadata = {
  title: 'Knea - Шалгалтын дүн',
  openGraph: {
    type: 'website',
    siteName: 'Knea - Шалгалтын дүн',
    title: 'Knea - Шалгалтын дүн',
    description: 'Сурагчын дүнгийн систем'
  }
}

export default async function GradePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user?.name) {
    return redirect('/login')
  }
  if (session.user.role === 'TEACHER') {
    redirect('/teacher')
  }

  const examDataRaw = await getStudentExams(
    session.user.systemId,
    String(session.user.currectAcademicLevel)
  )

  const data = examDataRaw.map(
    (exam): ExamTableData => ({
      examName: exam.name,
      grade: exam.grade,
      point: exam.point,
      status: exam.status
    })
  )

  return <ExamLayout data={data} />
}
