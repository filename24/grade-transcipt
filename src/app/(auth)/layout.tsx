import type { ReactNode } from 'react'

export default async function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <main className="w-full max-w-[100vw] p-4 min-h-[calc(100vh-3rem)] flex flex-col justify-center items-center gap-8">
      {children}
    </main>
  )
}
