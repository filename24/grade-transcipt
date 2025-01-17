import type { Session } from 'next-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { User2 } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function UserMenu({ session }: { session: Session | null }) {
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
        <DropdownMenuItem onClick={() => signOut()}>Гарах</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
