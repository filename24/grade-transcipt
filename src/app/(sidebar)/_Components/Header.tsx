'use client'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'

export function AppSidebarHeader({ children }: { children: React.ReactNode }) {
  const { setTheme, theme } = useTheme()
  const [isDark, setIsDark] = useState(theme === 'dark')
  const toggleTheme = () => {
    setIsDark(!isDark)
    setTheme(isDark ? 'light' : 'dark')
  }
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 dark:bg-[#181825]">
      <SidebarTrigger />
      <Button onClick={toggleTheme} variant="ghost" size="icon">
        {isDark ? <Sun /> : <Moon />}
      </Button>
      <Breadcrumb>{children}</Breadcrumb>
    </header>
  )
}
