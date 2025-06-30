import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <main>
      <div className="px-6 py-4">
        {/* Avatar and Status */}
        <div className="relative mb-4 w-fit">
          <Skeleton className="size-24 rounded-full" />
        </div>

        {/* Username */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid gap-2">
          <Skeleton className="h-[315px] w-full" />

          <Skeleton className="h-[135px] w-full" />
        </div>
      </div>
    </main>
  )
}
