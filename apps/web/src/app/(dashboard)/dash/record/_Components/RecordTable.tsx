'use client'

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import {
  calcAverageGrade,
  getGradeCode,
  isElementarySchool,
  type StudentGradeRecord
} from '@/utils'
import { ClassIcon } from '@/utils/icons'
import type { ClassCode } from '@/types/ESIS'

export type GradeTableData = Omit<StudentGradeRecord, 'schoolName'>

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
              )[0] as keyof typeof ClassCode
            ]
          }
          <p>{props.getValue() as string}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'grade',
    header: 'Түвшин',
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
        <Button
          variant="ghost"
          size={'sm'}
          className="gap-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Дүн
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell(props) {
      return <p className="text-center">{props.getValue() as string}</p>
    }
  }
]

interface DataTableProps<TValue, TData extends StudentGradeRecord> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TValue, TData extends StudentGradeRecord>({
  columns,
  data
}: DataTableProps<TValue, TData>) {
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
                Хайлт олдсонгүй.
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        {isElementarySchool(data[0].academicLevel) ? null : (
          <TableFooter>
            <TableRow>
              <TableCell className="bg-gray-300 dark:bg-[#151520]">
                Дундаж
              </TableCell>
              <TableCell className="bg-gray-300 text-center font-bold dark:bg-[#151520]">
                {getGradeCode(calcAverageGrade(data))}
              </TableCell>
              <TableCell className="bg-gray-300 text-center font-bold dark:bg-[#151520]">
                {calcAverageGrade(data)}
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  )
}
