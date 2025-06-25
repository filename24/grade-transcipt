'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, User, FileCheck } from 'lucide-react'
import { cn } from '@/utils'
const mainTabs = [
  {
    name: 'Home',
    href: '/dash',
    icon: Home
  }
]

const subTabs = [
  {
    name: 'Home',
    href: '/dash',
    icon: Home
  },
  {
    name: 'Дүн',
    href: '/dash/grade',
    icon: BarChart3
  },
  {
    name: 'Хувийн хэрэг',
    href: '/dash/record',
    icon: FileCheck
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User
  }
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <div className="sticky right-0 bottom-10 left-0 z-50 mx-10 rounded-3xl border shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-card/10 md:hidden">
      <div className="grid grid-cols-4">
        {subTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center px-1 py-4 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn('mb-1 h-5 w-5', isActive && 'text-primary')}
              />
              <span className="text-sm leading-none">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
