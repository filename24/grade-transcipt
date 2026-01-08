import { GradeStatus, SubjectName } from '@gt/esis'
import { Terminal } from 'lucide-react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { resolveClassCode } from '@/utils'
import { auth } from '@/utils/better-auth'
import { getStudentGrade } from '@/utils/fetch'
import { headers } from 'next/headers'

import GradeLayout from './_Components/GradeLayout'
import type { GradeTableData } from './_Components/GradeTable'

export const metadata: Metadata = {
  title: 'Knea - Хичээлийн дүн',
  openGraph: {
    type: 'website',
    siteName: 'Knea - Хичээлийн дүн',
    title: 'Knea - Хичээлийн дүн',
    description: 'Сурагчын дүнгийн систем'
  }
}

export default async function GradePage({
  searchParams
}: {
  searchParams?: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const params = await searchParams

  if (!session?.user?.name) {
    return redirect('/login')
  }
  if (session.user.role === 'TEACHER') {
    redirect('/teacher')
  }

  const semester1GradeRaw = await getStudentGrade(
    session.user.systemId,
    1,
    params?.academicYear
  )
  const semester2GradeRaw = await getStudentGrade(
    session.user.systemId,
    2,
    params?.academicYear
  )

  const semester1Data = semester1GradeRaw.map(
    (grade): GradeTableData => ({
      className: resolveClassCode(grade.classCode),
      grade: grade.grade,
      point: grade.point,
      status: grade.status,
      classCode: grade.classCode
    })
  )

  const semester2Data = semester2GradeRaw.map(
    (grade): GradeTableData => ({
      className: resolveClassCode(grade.classCode),
      grade: grade.grade,
      point: grade.point,
      status: grade.status,
      classCode: grade.classCode
    })
  )

  const getSubjectId = (name: string) => {
    const isElective = name.includes(' / Сонгон судлах /')
    const cleanName = name.replace(' / Сонгон судлах /', '').trim()
    const subject = SubjectName.find((s) => s.subjectName === cleanName)
    return (subject ? subject.subjectAreaId : 9999) + (isElective ? 10000 : 0)
  }

  semester1Data.sort(
    (a, b) => getSubjectId(a.className) - getSubjectId(b.className)
  )
  semester2Data.sort(
    (a, b) => getSubjectId(a.className) - getSubjectId(b.className)
  )

  return (
    <main>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Хичээлийн дүн</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-4">
        <h3 className="font-semibold text-2xl tracking-tight">Хичээлийн дүн</h3>
      </div>

      <Alert className="mb-4">
        <Terminal />
        <AlertTitle>Дүнгийн төлөвийн мэдээлэл</AlertTitle>
        <AlertDescription className="grid gap-2">
          <div>
            <Badge
              variant="secondary"
              className="bg-[#c0f1b6] text-[#548164] dark:bg-[#375841] dark:text-[#64d88d]"
            >
              {GradeStatus.APPROVED}
            </Badge>{' '}
            Дүн менежерээр батлуулагдсан
          </div>
          <div>
            <Badge
              variant="secondary"
              className="bg-[#c1e6f4] text-[#487CA5] dark:bg-[#2f4469] dark:text-[#63a1fc]"
            >
              {GradeStatus.NEW}
            </Badge>{' '}
            Мэргэжлийн багш дүнгээ шивсэн
          </div>
          <div>
            <Badge
              variant="secondary"
              className="bg-[#eedeaa] text-[#C29343] dark:bg-[#836534] dark:text-[#e4ab43]"
            >
              {GradeStatus.PENDING}
            </Badge>{' '}
            Мэргэжлийн багш дүнгээ менежерт илгээсэн
          </div>
          <div>
            <Badge
              variant="secondary"
              className="bg-[#f6baba] text-[#C4554D] dark:bg-[#673932] dark:text-[#e66359]"
            >
              {GradeStatus.REJECTED}
            </Badge>{' '}
            Мэргэжлийн багш эсвэл менежерийн хүсэлтээр дүн цуцалсан
          </div>
        </AlertDescription>
      </Alert>

      <GradeLayout semester1={semester1Data} semester2={semester2Data} />
    </main>
  )
}
