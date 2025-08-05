'use client'
import { Suspense, useState } from 'react'
import { columns, DataTable, type GradeTableData } from './GradeTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRight, Terminal } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { GradeStatus } from '@gt/esis'
import { Badge } from '@/components/ui/badge'
import { CURRECT_SEMESTER } from '@/utils/constants'

export default function GradeLayout({
  semester1,
  semester2
}: { semester1: GradeTableData[]; semester2: GradeTableData[] }) {
  const [select, setSelects] = useState<GradeTableData[]>(semester2)

  return (
    <>
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
            Дүн менежерээр батлуулагдсан (Солих боломжгүй)
          </div>
          <div>
            <Badge
              variant="secondary"
              className="bg-[#c1e6f4] text-[#487CA5] dark:bg-[#2f4469] dark:text-[#63a1fc]"
            >
              {GradeStatus.NEW}
            </Badge>{' '}
            Мэргэжлийн багш дүнгээ шивсэн (Солигдох магадлалтай)
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
            Мэргэжлийн багш эсвэл менежерийн хүсэлтээр дүн цуцалсан (Солигдох
            магадлалтай)
          </div>
        </AlertDescription>
      </Alert>

      <div className="flex flex-row justify-between">
        <Select
          defaultValue={String(CURRECT_SEMESTER + 1)}
          onValueChange={(value: '1' | '2') => {
            setSelects(value === '1' ? semester1 : semester2)
          }}
        >
          <SelectTrigger className="mb-2 w-[180px] text-muted-foreground">
            <SelectValue placeholder="Хагас жил" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1-р хагас жил</SelectItem>
            <SelectItem value="2">2-р хагас жил</SelectItem>
          </SelectContent>
        </Select>

        <Link
          href={'/dash/record'}
          className={buttonVariants({ variant: 'ghost' })}
        >
          <ArrowRight />
          Хувийн хэргийн дүн
        </Link>
      </div>

      <Suspense>
        <DataTable columns={columns} data={select} />
      </Suspense>
    </>
  )
}
