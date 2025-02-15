'use client'
import ThemeSwitcher from '@/components/theme-switcher'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function AppSidebarHeader({ children }: { children: React.ReactNode }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 dark:bg-[#181825]">
      <SidebarTrigger />
      <ThemeSwitcher />
      <Breadcrumb>{children}</Breadcrumb>
    </header>
  )
}
