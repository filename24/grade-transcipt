'use client'

import type { Grade } from '@gt/database/browser'
import type { GradeStatusType } from '@gt/esis'
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import * as React from 'react'

import { GradeStatusBadge } from '@/components/GradeStatusBadge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { givenNameSort } from '@/utils/name'

import { BulkActionToolbar } from './BulkActionToolbar'
import { GradeFilterBar } from './GradeFilterBar'
import { GradeScopeSelector } from './GradeScopeSelector'

const COLUMN_VISIBILITY_KEY = 'admin-grade-edit:column-visibility'

// 컬럼 표시 토글 드롭다운에서 보여줄 라벨 (몽골어).
const COLUMN_LABELS: Record<string, string> = {
  displayName: 'Нэр',
  classCode: 'Хичээл',
  classGrade: 'Анги',
  point: 'Оноо',
  grade: 'Үнэлгээ',
  status: 'Төлөв',
  academicYear: 'Хичээлийн жил',
  semester: 'Хагас жил'
}

export type GradeTableData = Pick<
  Grade,
  | 'id'
  | 'academicYear'
  | 'displayName'
  | 'classCode'
  | 'classGrade'
  | 'semester'
  | 'point'
  | 'status'
  | 'grade'
>

// classCode는 "<과목키> <유형>" 형식(예: "МХЛ заавал").
// 과목(subject)과 유형(type=заавал/сонгон)을 각각 부분 일치로 결합 필터링한다.
export type ClassCodeFilterValue = {
  subject?: string
  type?: string
}

const sortableHeader =
  (label: string) =>
  ({ column }: { column: Column<GradeTableData> }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ArrowUpDown />
    </Button>
  )

export const columns: ColumnDef<GradeTableData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'displayName',
    header: sortableHeader('Нэр'),
    cell: ({ row }) => <div>{row.getValue('displayName')}</div>,
    sortingFn: givenNameSort
  },
  {
    accessorKey: 'classCode',
    header: sortableHeader('Хичээл'),
    cell: ({ row }) => <div>{row.getValue('classCode')}</div>,
    filterFn: (row, columnId, value: ClassCodeFilterValue) => {
      const code = String(row.getValue(columnId))
      if (value.subject && !code.includes(value.subject)) {
        return false
      }
      if (value.type && !code.includes(value.type)) {
        return false
      }
      return true
    }
  },
  {
    accessorKey: 'classGrade',
    header: sortableHeader('Анги'),
    cell: ({ row }) => <div>{row.getValue('classGrade')}</div>,
    filterFn: 'equalsString'
  },
  {
    accessorKey: 'point',
    header: sortableHeader('Оноо'),
    cell: ({ row }) => <div>{row.getValue('point')}</div>
  },
  {
    accessorKey: 'grade',
    header: sortableHeader('Үнэлгээ'),
    cell: ({ row }) => <div>{row.getValue('grade')}</div>
  },
  {
    accessorKey: 'status',
    header: 'Төлөв',
    cell: ({ row }) => (
      <GradeStatusBadge
        status={row.getValue('status') as GradeStatusType | null}
      />
    ),
    filterFn: 'equalsString'
  },
  {
    accessorKey: 'academicYear',
    header: sortableHeader('Хичээлийн жил'),
    cell: ({ row }) => <div>{row.getValue('academicYear')}</div>
  },
  {
    accessorKey: 'semester',
    header: sortableHeader('Хагас жил'),
    cell: ({ row }) => <div>{row.getValue('semester')}</div>
  }
]

interface GradeAdminTableProps {
  data: GradeTableData[]
  academicYears: string[]
  semesters: number[]
  academicYear: string
  semester: number
}

export function GradeAdminTable({
  data,
  academicYears,
  semesters,
  academicYear,
  semester
}: GradeAdminTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    usePersistentState<VisibilityState>(COLUMN_VISIBILITY_KEY, {})
  const [rowSelection, setRowSelection] = React.useState({})

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 50
  })

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    }
  })

  const filteredRows = table.getFilteredRowModel().rows
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map((row) => row.original.id)
  const showSelectAllFiltered =
    selectedIds.length > 0 && selectedIds.length < filteredRows.length

  const selectAllFiltered = () => {
    const next: Record<string, boolean> = {}
    for (const row of filteredRows) {
      next[row.id] = true
    }
    table.setRowSelection(next)
  }

  return (
    <div className="w-full space-y-4">
      <React.Suspense fallback={null}>
        <GradeScopeSelector
          academicYears={academicYears}
          semesters={semesters}
          academicYear={academicYear}
          semester={semester}
        />
      </React.Suspense>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <GradeFilterBar table={table} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Багана <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {COLUMN_LABELS[column.id] ?? column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <BulkActionToolbar
        selectedIds={selectedIds}
        onDone={() => table.resetRowSelection()}
      />

      {showSelectAllFiltered && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span>Энэ хуудасны {selectedIds.length} мөр сонгогдсон.</span>
          <Button
            variant="link"
            className="h-auto p-0"
            onClick={selectAllFiltered}
          >
            Шүүлтэд тохирох бүх {filteredRows.length} мөрийг сонгох
          </Button>
        </div>
      )}

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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Үр дүн олдсонгүй.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-muted-foreground text-sm">
          {selectedRows.length} / {filteredRows.length} мөр сонгосон.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Өмнөх
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Дараах
          </Button>
        </div>
      </div>
    </div>
  )
}
