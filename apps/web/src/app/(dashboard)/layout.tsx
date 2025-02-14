import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import { auth } from '@/utils/auth'

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <div className="flex flex-1 flex-col border-grid">
      <Navbar session={session} />
      <main className="mx-auto w-full max-w-6xl grow py-4">
        <div className="p-2">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
