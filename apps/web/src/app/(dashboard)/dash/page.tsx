import { auth } from '@/utils/auth'
import GradeAverage from './_Components/GradeAverage'
import { redirect } from 'next/navigation'
import { getStudentGrade } from '@/utils/fetch'
import Top5GradeChart from './_Components/Top5GradeChart'
import GradePieChart from './_Components/GradePieChart'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowRight, Terminal } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { EXAM_DATE } from '@/utils/constants'
import { makeDashboardMessage } from '@/utils'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.name) {
    return redirect('/login')
  }

  if (session.user.role === 'TEACHER') {
    redirect('/teacher')
  }

  const semester1Grade = await getStudentGrade(session.user.systemId, 1)

  const semester2Grade = await getStudentGrade(session.user.systemId, 2)

  const now = new Date()
  const dashboardMessage = makeDashboardMessage(now)
  return (
    <main className="grid gap-4">
      <div>
        <h3 className="font-semibold text-2xl tracking-tight">
          Тавтай морилно уу, {session?.user?.name}
        </h3>
        <p className="text-muted-foreground">
          Өнөөдөр{' '}
          {Intl.DateTimeFormat('mn', {
            dateStyle: 'full'
          }).format(Date.now())}
        </p>
        <p className="text-muted-foreground text-sm">{dashboardMessage}</p>
      </div>

      <div className="grid gap-4">
        <GradeAverage semester1={semester1Grade} semester2={semester2Grade} />
      </div>

      {EXAM_DATE.START <= now ? (
        <Alert>
          <Terminal />
          <AlertTitle>Нэмэлт мэдээ</AlertTitle>
          <AlertDescription>
            <p>
              Та улсын шалгалт, дэвших шалгалтын дүнгээ эндээс харах боломжтой!
            </p>
            <Link
              href={'/dash/exam'}
              className={`flex ${buttonVariants({ variant: 'link', size: 'sm' })}`}
            >
              <ArrowRight size={20} />
              <p>Шалгалтын дүн харах</p>
            </Link>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <Terminal />
          <AlertTitle>Мэдэгдэл</AlertTitle>
          <AlertDescription>
            <p>
              2024-2025 оны хичээлийн жилийн дүнгийн мэдээллийг 9-р сарын
              20-ноос хойш өөр газар руу шилжүүлэх тул ашиглахдаа анхаарна уу.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Top5GradeChart semester1={semester1Grade} semester2={semester2Grade} />
        <GradePieChart semester1={semester1Grade} semester2={semester2Grade} />
      </div>
    </main>
  )
}
