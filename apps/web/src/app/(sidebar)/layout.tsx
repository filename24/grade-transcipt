import { AppSidebar } from './_Components/Sidebar'

import { SidebarProvider } from '@/components/ui/sidebar'
import { auth } from '@/utils/better-auth'
import { headers } from 'next/headers'

export default async function Layout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <main className="w-screen">{children}</main>
    </SidebarProvider>
  )
}
