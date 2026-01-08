import { BottomTabBar } from '@/components/appbar'
import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import { auth } from '@/utils/better-auth'
import { headers } from 'next/headers'

import PasswordSetupChecker from './_Components/PasswordSetupChecker'

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  return (
    <div className="flex min-h-dvh flex-1 flex-col border-grid">
      <Navbar session={session} />
      <main className="mx-auto w-full max-w-6xl grow py-4">
        <div className="p-2">{children}</div>
      </main>
      <Footer />
      <BottomTabBar session={session} />
      {session && <PasswordSetupChecker />}
    </div>
  )
}
