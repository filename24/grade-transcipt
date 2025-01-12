import Navbar from '@/components/navbar'

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="border-grid flex flex-1 flex-col">
      <Navbar />
      <main className="flex-grow w-full max-w-6xl mx-auto py-4">
        {children}
      </main>
    </div>
  )
}
