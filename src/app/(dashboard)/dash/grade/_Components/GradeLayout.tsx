'use client'
import { Suspense, useState } from 'react'
import { columns, DataTable, GradeTableData } from './GradeTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export default function GradeLayout({
  semester1,
  semester2
}: { semester1: GradeTableData[]; semester2: GradeTableData[] }) {
  const [select, setSelects] = useState<GradeTableData[]>(semester1)

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

      <div className="flex flex-row justify-between">
        <Select
          defaultValue="1"
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
