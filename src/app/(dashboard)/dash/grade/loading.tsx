import { Skeleton } from '@/components/ui/skeleton'

export default function GradeLoading() {
  return (
    <main>
      <div className="mb-4">
        <h3 className="font-semibold text-2xl tracking-tight">Хичээлийн дүн</h3>
      </div>

      <div className="mb-2">
        <Skeleton className="h-8 w-[180px]" />
      </div>

      <Skeleton className="h-[750px] w-full" />
    </main>
  )
}
