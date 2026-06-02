import prisma from '@gt/database'
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
import { CURRECT_ACADEMIC_YEAR, CURRECT_SEMESTER } from '@/utils/constants'

import { GradeAdminTable } from './_Components/GradeAdminTable'

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // 쿼리 이전에 권한을 검사한다 (비관리자에게 데이터가 조회되지 않도록).
  if (session?.user?.role !== 'ADMIN') {
    return redirect('/dash')
  }

  const params = await searchParams
  const rawYear = params?.academicYear
  const academicYear =
    rawYear && /^\d{4}$/.test(rawYear) ? rawYear : CURRECT_ACADEMIC_YEAR
  const parsedSemester = Number(params?.semester)
  const semester =
    parsedSemester === 1 || parsedSemester === 2
      ? parsedSemester
      : CURRECT_SEMESTER + 1

  // scope 옵션은 필터된 data가 아니라 별도 distinct 쿼리로 구한다.
  const [data, academicYearRows, semesterRows] = await Promise.all([
    prisma.grade.findMany({
      select: {
        id: true,
        academicYear: true,
        displayName: true,
        classCode: true,
        classGrade: true,
        semester: true,
        point: true,
        status: true,
        grade: true
      },
      where: { academicYear, semester }
    }),
    prisma.grade.findMany({
      distinct: ['academicYear'],
      select: { academicYear: true },
      orderBy: { academicYear: 'desc' }
    }),
    prisma.grade.findMany({
      distinct: ['semester'],
      select: { semester: true },
      orderBy: { semester: 'asc' }
    })
  ])

  const academicYears = academicYearRows.map((row) => row.academicYear)
  const semesters = semesterRows.map((row) => row.semester)

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
        <GradeAdminTable
          data={data}
          academicYears={academicYears}
          semesters={semesters}
          academicYear={academicYear}
          semester={semester}
        />
      </div>
    </>
  )
}
