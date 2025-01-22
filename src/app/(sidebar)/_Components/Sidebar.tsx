'use client'
import * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar'
import { Session } from 'next-auth'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const data = {
  admin: [
    {
      title: 'Grade',
      url: '#',
      items: [
        {
          title: 'Export a grade data',
          url: '#',
          isActive: true
        },
        {
          title: 'Fetch a grade data',
          url: '#'
        }
      ]
    }
  ],
  teacher: [
    {
      title: 'Дүн, мэдээлэл',
      url: '#',
      items: [
        {
          title: 'Хичээлийн дүн',
          url: '#',
          isActive: true
        },
        {
          title: 'Дүн татах',
          url: '#'
        }
      ]
    }
  ]
}

export function AppSidebar({
  session,
  ...props
}: React.ComponentProps<typeof Sidebar> & { session: Session | null }) {
  const pathname = usePathname()
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
                        <SidebarMenuButton asChild isActive={item.isActive}>
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
                        <SidebarMenuButton asChild isActive={item.isActive}>
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
