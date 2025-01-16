import Footer from '@/components/footer'
import Navbar from '@/components/navbar'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex flex-1 flex-col border-grid">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-grow py-4">
        {children}
      </main>
      <Footer />
    </div>
  )
}
