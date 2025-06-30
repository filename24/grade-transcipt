'use client'

import type { Session } from 'next-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { User2, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { CDN_ENDPOINT } from '@/utils/constants'
import { getUserDefaultAvatarUrl } from '@/utils'

export default function UserMenu({ session }: { session: Session | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Image
          src={
            session?.user?.avatar
              ? `${CDN_ENDPOINT}/avatar/${session.user.avatar}.png`
              : getUserDefaultAvatarUrl(session?.user?.registerNumber || '0')
          }
          width={32}
          height={32}
          alt="Profile avatar"
          className="size-8 rounded-lg"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          {session?.user?.name ?? 'Profile'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/profile" className="flex gap-1">
            <User2 size={20} />
            Хувийн мэдээлэл
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            signOut()
          }}
        >
          <div className="flex gap-1">
            <LogOut size={20} />
            Гарах
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
