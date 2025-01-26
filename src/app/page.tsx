'use client'

import { useSession } from '@/utils/auth'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (data) {
      router.push('/dash')
    } else {
      router.push('/login')
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="animate-spin" />
        <p className="text-xl">Түр хүлээнэ үү...</p>
      </div>
    </div>
  )
}
