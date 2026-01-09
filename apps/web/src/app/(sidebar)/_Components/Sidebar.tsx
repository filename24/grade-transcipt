'use client'
import { ChevronUp, User2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type * as React from 'react'
import { authClient } from '@/utils/auth-client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar'

const data = {
  admin: [
    {
      title: 'Grade',
      url: '#',
      items: [
        {
          title: 'Edit a grade data',
          url: '/admin/grade/edit'
        },
        {
          title: 'Import a grade data',
          url: '/admin/grade/create'
        },
        {
          title: 'Export grade data',
          url: '/admin/grade/export'
        }
      ]
    }
  ],
  teacher: [
    {
      title: 'Гүйцэтгэлийн үнэлгээ',
      url: '/unelgee',
      items: [
        {
          title: 'Ангийн журнал',
          url: '/unelgee/students',
          isActive: true
        },
        {
          title: 'Багшийн журнал',
          url: '/unelgee/teacher'
        },
        {
          title: 'Судалгаа бүртгэх',
          url: '/unelgee/sudalgaa'
        }
      ]
    }
  ]
}

export function AppSidebar({
  session,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  session: typeof authClient.$Infer.Session | null
}) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link href="/dash" className="flex items-center gap-x-3 p-2">
          <Image width={32} height={32} alt="" src="/knea.png" />
          <span className="font-bold text-lg sm:text-xl">Knea</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {pathname.includes('admin')
          ? data.admin.map((item) => (
              <SidebarGroup key={item.title}>
                <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.url === pathname}
                        >
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))
          : data.teacher.map((item) => (
              <SidebarGroup key={item.title}>
                <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.url === pathname}
                        >
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
      </SidebarContent>
      {session ? (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size={'lg'}>
                    <User2 /> {session?.user?.name}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuLabel>
                    {session?.user?.name ?? 'Profile'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/profile">Хувийн мэдээлэл</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            router.push('/login')
                          }
                        }
                      })
                    }}
                  >
                    Гарах
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      ) : undefined}
      <SidebarRail />
    </Sidebar>
  )
}
