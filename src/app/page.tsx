'use client'

import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: _session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dash')
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Loading state while checking authentication
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-2">
        <Loader2 className="animate-spin" />
        <p className="text-xl">Түр хүлээнэ үү...</p>
      </div>
    </div>
  )
}
