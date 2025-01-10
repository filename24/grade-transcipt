import { auth } from '@/utils/auth'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold">
          Тавтай морилно уу, {session?.user?.name}
        </h2>
        <p className="text-base">
          Өнөөдөр{' '}
          {Intl.DateTimeFormat('mn', {
            dateStyle: 'full'
          }).format(Date.now())}
        </p>
      </div>
    </div>
  )
}
