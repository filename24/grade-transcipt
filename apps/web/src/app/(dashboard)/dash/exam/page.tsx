import { auth } from '@/utils/auth'
import { redirect } from 'next/navigation'
import type { ExamTableData } from './_Components/ExamTable'
import ExamLayout from './_Components/ExamLayout'
import { getStudentExams } from '@/utils/fetch'

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
