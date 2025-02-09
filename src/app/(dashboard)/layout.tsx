'use client'

import Footer from '@/components/footer'
import Navbar from '@/components/navbar'

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex flex-1 flex-col border-grid">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl grow py-4">
        <div className="p-2">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
