import { Skeleton } from '@/components/ui/skeleton'
import { makeDashboardMessage } from '@/utils'

export default function DashboardLoading() {
  const now = new Date()
  const dashboardMessage = makeDashboardMessage(now)
  return (
    <main>
      <div className="mb-4">
        <h3 className="font-semibold text-2xl tracking-tight">
          Тавтай морилно уу,
        </h3>
        <p className="">
          Өнөөдөр{' '}
          {Intl.DateTimeFormat('mn', {
            dateStyle: 'full'
          }).format(Date.now())}
        </p>
        <p className="text-muted-foreground text-sm">{dashboardMessage}</p>
      </div>

      <div className="grid gap-4">
        <Skeleton className="h-[160px] w-full" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Skeleton className="col-span-full h-[420px] w-full md:col-span-1" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    </main>
  )
}
