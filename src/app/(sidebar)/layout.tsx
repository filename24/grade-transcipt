import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './_Components/Sidebar'
import { getSession } from '@/utils/auth'
import { headers } from 'next/headers'

export default async function Layout({
  children
}: { children: React.ReactNode }) {
  const session = await getSession(await headers())
  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <main className="w-screen">{children}</main>
    </SidebarProvider>
  )
}
