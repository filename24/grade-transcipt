import { auth } from '@/utils/auth'
import GradeAverage from './_Components/GradeAverage'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="p-2">
      <div className="mb-4">
        <h3 className="text-2xl font-semibold tracking-tight">
          Тавтай морилно уу, {session?.user?.name}
        </h3>
        <p className="">
          Өнөөдөр{' '}
          {Intl.DateTimeFormat('mn', {
            dateStyle: 'full'
          }).format(Date.now())}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <GradeAverage session={session} />
      </div>
    </div>
  )
}
