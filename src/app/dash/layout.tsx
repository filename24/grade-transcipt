export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex flex-col lg:flex-row gap-2 lg:gap-6 py-8 px-4">
      <main className="flex-grow w-full max-w-6xl mx-auto">{children}</main>
    </div>
  )
}
