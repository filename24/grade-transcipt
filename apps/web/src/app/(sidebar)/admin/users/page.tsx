import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { AppSidebarHeader } from '@/app/(sidebar)/_Components/Header'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { auth } from '@/utils/better-auth'

import { UserTable } from './_Components/UserTable'

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session?.user?.role !== 'ADMIN') {
    return redirect('/dash')
  }

  return (
    <>
      <AppSidebarHeader>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </AppSidebarHeader>

      <div className="md:p-6">
        <UserTable />
      </div>
    </>
  )
}
