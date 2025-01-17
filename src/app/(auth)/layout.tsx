'use client'

import Footer from '@/components/footer'
import type { ReactNode } from 'react'

export default function AuthLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <main className="flex min-h-[calc(100vh-10rem)] w-full max-w-[100vw] flex-col items-center justify-center gap-8 p-4">
      {children}
      <Footer />
    </main>
  )
}
