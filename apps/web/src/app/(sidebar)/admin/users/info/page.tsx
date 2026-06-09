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

import { UserInfoManager } from './_Components/UserInfoManager'

export default async function AdminUserInfoPage() {
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
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Additional info</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </AppSidebarHeader>

      <div className="md:p-6">
        <UserInfoManager />
      </div>
    </>
  )
}
