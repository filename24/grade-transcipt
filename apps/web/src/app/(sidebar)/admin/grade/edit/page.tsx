import prisma from '@gt/database'
import { redirect } from 'next/navigation'

import { AppSidebarHeader } from '@/app/(sidebar)/_Components/Header'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { auth } from '@/utils/auth'
import { CURRECT_SEMESTER } from '@/utils/constants'

import { GradeAdminTable } from './_Components/GradeAdminTable'

export default async function AdminPage() {
  const session = await auth()

  const data = await prisma.grade.findMany({
    select: {
      academicYear: true,
      displayName: true,
      classCode: true,
      semester: true,
      point: true,
      status: true,
      grade: true,
      registerNumber: true
    },
    where: {
      semester: CURRECT_SEMESTER + 1
    }
  })
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
          <GradeAdminTable data={data} />
        </div>
      </>
    )
  }

  return redirect('/dash')
}
