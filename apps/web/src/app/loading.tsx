import { Loader2 } from 'lucide-react'

export default function HomeLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="animate-spin" />
        <p className="text-xl">Түр хүлээнэ үү...</p>
      </div>
    </div>
  )
}
