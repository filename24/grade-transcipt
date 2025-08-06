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
import { CURRECT_SEMESTER } from '@/utils/constants'

export default function GradeLayout({
  semester1,
  semester2
}: {
  semester1: GradeTableData[]
  semester2: GradeTableData[]
}) {
  const [select, setSelects] = useState<GradeTableData[]>(
    CURRECT_SEMESTER === 0 ? semester1 : semester2
  )

  return (
    <>
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

      <DataTable columns={columns} data={select} />
    </>
  )
}
