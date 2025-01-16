import { auth } from '@/utils/auth'
import GradeAverage from './_Components/GradeAverage'
import { redirect } from 'next/navigation'
import { getStudentGrade } from '@/utils/fetch'
import Top5GradeChart from './_Components/Top5GradeChart'
import GradePieChart from './_Components/GradePieChart'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.name) {
    return redirect('/login')
  }

  const semester1Grade = await getStudentGrade(session.user.name, 1)

  const semester2Grade = await getStudentGrade(session.user.name, 2)

  return (
    <div className="p-2">
      <div className="mb-4">
        <h3 className="font-semibold text-2xl tracking-tight">
          Тавтай морилно уу, {session?.user?.name}
        </h3>
        <p className="">
          Өнөөдөр{' '}
          {Intl.DateTimeFormat('mn', {
            dateStyle: 'full',
          }).format(Date.now())}
        </p>
      </div>

      <div className="grid gap-4">
        <GradeAverage semester1={semester1Grade} semester2={semester2Grade} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Top5GradeChart semester1={semester1Grade} semester2={semester2Grade} />
        <GradePieChart semester1={semester1Grade} semester2={semester2Grade} />
      </div>
    </div>
  )
}
