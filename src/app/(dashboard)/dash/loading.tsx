import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
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
