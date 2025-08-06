'use client'

import { type CourseCode, GradeStatus, type GradeStatusType } from '@gt/esis'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  calcAverageGrade,
  calculateGradeCode,
  type GradePointOnly
} from '@/utils'
import { ClassIcon } from '@/utils/icons'

export type GradeTableData = {
  className: string
  classCode: string
  point: number
  grade: string
  status: string
  teacherName?: string
}

export const columns: ColumnDef<GradeTableData>[] = [
  {
    accessorKey: 'className',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Хичээлийн нэр
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell(props) {
      return (
        <div className="flex min-w-[200px] flex-row gap-2">
          {
            ClassIcon[
              props.row.original.classCode.split(
                ' '
              )[0] as keyof typeof CourseCode
            ]
          }
          <p>{props.getValue() as string}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'grade',
    header: () => {
      return <p className="text-center">Түвшин</p>
    },
    cell(props) {
      return (
        <p className="text-nowrap text-center">{props.getValue() as string}</p>
      )
    }
  },
  {
    accessorKey: 'point',
    header: ({ column }) => {
      return (
        <>
          <div className="grid justify-center">
            <Button
              variant="ghost"
              size={'sm'}
              className="gap-0 p-0"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Дүн
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )
    },
    cell(props) {
      return <p className="text-center">{props.getValue() as string}</p>
    }
  },
  {
    accessorKey: 'status',
    header: () => {
      return <p className="text-center">Төлөв</p>
    },
    cell: ({ row }) => {
      const grade = row.getValue('status') as GradeStatusType
      const formatted = GradeStatus[grade]

      return (
        <>
          <div className="grid w-full justify-center">
            {grade === 'APPROVED' ? (
              <Badge
                variant="secondary"
                className="bg-[#c0f1b6] text-[#548164] dark:bg-[#375841] dark:text-[#64d88d]"
              >
                {formatted}
              </Badge>
            ) : grade === 'NEW' ? (
              <Badge
                variant="secondary"
                className="bg-[#c1e6f4] text-[#487CA5] dark:bg-[#2f4469] dark:text-[#63a1fc]"
              >
                {formatted}
              </Badge>
            ) : grade === 'PENDING' ? (
              <Badge
                variant="secondary"
                className="bg-[#eedeaa] text-[#C29343] dark:bg-[#836534] dark:text-[#e4ab43]"
              >
                {formatted}
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-[#f6baba] text-[#C4554D] dark:bg-[#673932] dark:text-[#e66359]"
              >
                {formatted}
              </Badge>
            )}
          </div>
        </>
      )
    }
  }
]

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting
    }
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Дүн гараагүй.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell
              colSpan={1}
              className="bg-gray-300 text-center dark:bg-[#151520]"
            >
              Дундаж
            </TableCell>
            <TableCell className="bg-gray-300 text-center font-bold dark:bg-[#151520]">
              {calculateGradeCode(
                calcAverageGrade(data as unknown as GradePointOnly[])
              )}
            </TableCell>
            <TableCell className="border-x-0 bg-gray-300 text-center font-bold dark:bg-[#151520]">
              {calcAverageGrade(data as unknown as GradePointOnly[])}
            </TableCell>
            <TableCell className="border-x-0 bg-gray-300 dark:bg-[#151520]" />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
