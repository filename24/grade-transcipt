'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Session, signOut } from '@/utils/auth'
import { User2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UserMenu({ session }: { session: Session | null }) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <User2 />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          {session?.user?.name ?? 'Profile'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/profile">Хувийн мэдээлэл</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push('/login') // redirect to login page
                }
              }
            })
          }
        >
          Гарах
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
