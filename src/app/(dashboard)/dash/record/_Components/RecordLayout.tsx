/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'
import { useState } from 'react'
import { columns, DataTable } from './RecordTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { AcademicYearData } from '@/types/ESIS'
import { filterUniqueClassNames, StudentGradeRecord } from '@/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export default function RecordLayout({
  gradeRecords,
  academicYears
}: { gradeRecords: StudentGradeRecord[]; academicYears: AcademicYearData[] }) {
  const highestAcademicYear = academicYears.reduce((max, current) => {
    return parseInt(current.academicYear) > parseInt(max.academicYear)
      ? current
      : max
  }, academicYears[0])
  const [select, setSelects] = useState<string>(
    highestAcademicYear.academicLevel
  )

  const data =
    select === '0'
      ? gradeRecords
      : filterUniqueClassNames(
          gradeRecords.filter(
            (record) => String(parseInt(record.academicLevel)) === select
          )
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
            <BreadcrumbPage>Хувийн хэргийн дүн</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-4">
        <h3 className="font-semibold text-2xl tracking-tight">
          Хувийн хэргийн дүн
        </h3>
      </div>

      <div className="flex flex-row justify-between">
        <Select
          defaultValue={select}
          onValueChange={(value: string) => {
            setSelects(value)
          }}
        >
          <SelectTrigger className="mb-2 w-[180px] text-muted-foreground">
            <SelectValue placeholder="Хагас жил" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((academicYears) => {
              return (
                <SelectItem
                  key={academicYears.academicLevel}
                  value={academicYears.academicLevel}
                >
                  {academicYears.academicYearName}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* @ts-ignore */}
      <DataTable columns={columns} data={data} />
    </main>
  )
}
