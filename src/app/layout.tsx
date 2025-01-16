import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@vercel/analytics/react'
import { SessionProvider } from 'next-auth/react'

export const metadata: Metadata = {
  title: 'Knea - Grade transcript',
  description: 'Knea - Grade transcript',
  authors: {
    name: '__filename',
    url: 'https://github.com/filename24',
  },
  openGraph: {
    type: 'website',
    locale: 'mn_MN',
    url: 'https://knea-gt.vercel.app',
    siteName: 'Knea - Grade transcript',
    title: 'Knea - Grade transcript',
    description: 'Сурагчын дүнгийн систем',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="mn">
      <head>
        {/* Font Ready */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        {/* Pretendard Variable */}
        <link
          rel="preload"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-svh w-full max-w-[100vw] font-pretendard">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>{children}</SessionProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
