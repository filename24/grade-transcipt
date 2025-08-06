import { redirect } from 'next/navigation'

import { AppSidebarHeader } from '../../../_Components/Header'
import GradeTable from './_Components/Gradetable'

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { auth } from '@/utils/auth'

export default async function AdminPage() {
  const session = await auth()

  if (session?.user?.role === 'ADMIN') {
    return (
      <>
        <AppSidebarHeader>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Grade</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </AppSidebarHeader>

        <div className="md:p-6">
          <GradeTable />
        </div>
      </>
    )
  }

  return redirect('/dash')
}
