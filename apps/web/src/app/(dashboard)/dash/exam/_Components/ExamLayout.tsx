'use client'
import { Suspense } from 'react'
import { columns, DataTable, type ExamTableData } from './ExamTable'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export default function ExamLayout({ data }: { data: ExamTableData[] }) {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Шалгалтын дүн</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-4">
        <h3 className="font-semibold text-2xl tracking-tight">Шалгалтын дүн</h3>
      </div>

      <Suspense>
        <DataTable columns={columns} data={data} />
      </Suspense>
    </>
  )
}
