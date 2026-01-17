import prisma from '@gt/database'
import { ArrowRight, Shield, Terminal } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { makeDashboardMessage } from '@/utils'
import { auth } from '@/utils/better-auth'
import { EXAM_DATE } from '@/utils/constants'
import { getStudentGrade } from '@/utils/fetch'

import GradeAverage from './_Components/GradeAverage'
import GradePieChart from './_Components/GradePieChart'
import Top5GradeChart from './_Components/Top5GradeChart'

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const params = await searchParams

  if (!session?.user?.name) {
    return redirect('/login')
  }

  if (session.user.role === 'TEACHER') {
    redirect('/teacher')
  }

  const semester1Grade = await getStudentGrade(
    session.user.systemId,
    1,
    params?.academicYear
  )

  const semester2Grade = await getStudentGrade(
    session.user.systemId,
    2,
    params?.academicYear
  )

  // Check if user has password set
  const credentialAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: 'credential'
    },
    select: { password: true }
  })
  const hasPassword = !!credentialAccount?.password

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

      {!hasPassword && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">
            Нууц үг тохируулаагүй байна
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            <p>
              Бүртгэлээ аюулгүй болгохын тулд нууц үг тохируулна уу. Passkey
              ашиглахын тулд нууц үг шаардлагатай.
            </p>
            <Link
              href={'/profile'}
              className={`flex ${buttonVariants({ variant: 'link', size: 'sm' })} px-0 text-amber-800 dark:text-amber-200`}
            >
              <ArrowRight size={20} />
              <p>Профайл руу очих</p>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {EXAM_DATE.START <= now && (
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
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Top5GradeChart semester1={semester1Grade} semester2={semester2Grade} />
        <GradePieChart semester1={semester1Grade} semester2={semester2Grade} />
      </div>
    </main>
  )
}
