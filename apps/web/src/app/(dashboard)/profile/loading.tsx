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

        {/* Personal Info and System Info */}
        <div className="mb-2 grid gap-2 md:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>

        {/* Security Section */}
        <div className="mb-2">
          <Skeleton className="h-[280px] w-full" />
        </div>

        <div className="mb-2">
          <Skeleton className="h-80 w-full" />
        </div>

        {/* Session Manager */}
        <div className="mb-2">
          <Skeleton className="h-[280px] w-full" />
        </div>

        {/* Danger Zone */}
        <div className="grid gap-2">
          <Skeleton className="h-[120px] w-full" />
        </div>
      </div>
    </main>
  )
}
