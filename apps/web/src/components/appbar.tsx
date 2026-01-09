'use client'

import { BarChart3, FileCheck, Home } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { authClient } from '@/utils/auth-client'

import { cn, getUserDefaultAvatarUrl } from '@/utils'
import { CDN_ENDPOINT } from '@/utils/constants'

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
  }
]

export function BottomTabBar({
  session
}: {
  session: typeof authClient.$Infer.Session | null
}) {
  const pathname = usePathname()

  return (
    <div className="sticky right-0 bottom-10 left-0 z-50 mx-10 rounded-3xl border shadow-2xl backdrop-blur supports-backdrop-filter:bg-card/10 md:hidden">
      <div className="grid grid-cols-4">
        {subTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center px-1 py-4 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('mb-1 size-6', isActive && 'text-primary')} />
              <span className="text-xs leading-none">{tab.name}</span>
            </Link>
          )
        })}
        <Link
          key="profile"
          href="/profile"
          className={cn(
            'flex flex-col items-center justify-center px-1 py-4 transition-colors',
            pathname === '/profile'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Image
            src={
              session?.user?.avatar
                ? `${CDN_ENDPOINT}/avatar/${session.user.avatar}.png`
                : getUserDefaultAvatarUrl(session?.user?.systemId || '0')
            }
            width={100}
            height={100}
            alt="Profile avatar"
            className="mb-1 size-6 rounded-full"
          />

          <span className="text-xs leading-none">Profile</span>
        </Link>
      </div>
    </div>
  )
}
