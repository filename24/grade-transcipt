'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
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
import { ClassCode, GradeStatus } from '@/types/ESIS'
import { calcAverageGrade, getGradeCode } from '@/utils'
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
          className="gap-0 p-0"
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
  },
  {
    accessorKey: 'status',
    header: 'Төлөв',
    cell: ({ row }) => {
      const grade = row.getValue('status')
      const formatted = GradeStatus[grade as keyof typeof GradeStatus]

      return <div className="font-medium">{formatted}</div>
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
              {getGradeCode(calcAverageGrade(data as any))}
            </TableCell>
            <TableCell className="border-x-0 bg-gray-300 text-center font-bold dark:bg-[#151520]">
              {calcAverageGrade(data as any)}
            </TableCell>
            <TableCell className="border-x-0 bg-gray-300 dark:bg-[#151520]"></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
