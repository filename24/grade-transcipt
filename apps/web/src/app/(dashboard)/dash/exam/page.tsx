import { auth } from '@/utils/auth'
import { redirect } from 'next/navigation'
import type { ExamTableData } from './_Components/ExamTable'
import ExamLayout from './_Components/ExamLayout'
import { getStudentExams } from '@/utils/fetch'
import type { Metadata } from 'next'

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
  const session = await auth()

  if (!session?.user?.name) {
    return redirect('/login')
  }
  if (session.user.role === 'TEACHER') {
    redirect('/teacher')
  }

  const examDataRaw = await getStudentExams(session.user.systemId)

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
