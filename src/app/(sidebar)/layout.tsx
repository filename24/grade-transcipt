import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './_Components/Sidebar'
import { auth } from '@/utils/auth'

export default async function Layout({
  children
}: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <main className="w-screen">{children}</main>
    </SidebarProvider>
  )
}
