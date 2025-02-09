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

export default function GradeLayout({
  semester1,
  semester2
}: { semester1: GradeTableData[]; semester2: GradeTableData[] }) {
  const [select, setSelects] = useState<GradeTableData[]>(semester1)

  return (
    <>
      <div className="mb-4">
        <h3 className="font-semibold text-2xl tracking-tight">Хичээлийн дүн</h3>
      </div>

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

      <Suspense>
        <DataTable columns={columns} data={select} />
      </Suspense>
    </>
  )
}
