'use client'

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from '@tanstack/react-table'
import { ArrowUpDown, Download, Loader2, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { givenNameSort } from '@/utils/name'

import { ConfirmActionDialog } from '../../../grade/edit/_Components/ConfirmActionDialog'
import { deleteUserInfoBulk, listFieldNames, loadAllUserInfo } from '../actions'
import type { UserInfoListRow } from '../types'

const GENERIC_ERROR = 'Алдаа гарлаа. Дахин оролдоно уу.'
const ALL_FIELDS = '__all__'
const PAGE_SIZE = 50

// CSV 셀 이스케이프 (쉼표/따옴표/줄바꿈 포함 시 따옴표로 감싸기)
function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function downloadCsv(rows: UserInfoListRow[]): void {
  const header = ['Сурагч', 'Регистр', 'Нэр', 'Утга']
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [r.studentName, r.registerNumber, r.name, r.data]
        .map((cell) => escapeCsv(cell))
        .join(',')
    )
  ]
  // Excel에서 UTF-8(키릴/한글) 인식을 위해 BOM 추가
  const blob = new Blob([`﻿${lines.join('\r\n')}`], {
    type: 'text/csv;charset=utf-8'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'user-info.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const columns: ColumnDef<UserInfoListRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Бүгдийг сонгох"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Мөр сонгох"
      />
    ),
    enableSorting: false
  },
  {
    accessorKey: 'studentName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Сурагч <ArrowUpDown className="ml-1 size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('studentName')}</span>
    ),
    sortingFn: givenNameSort,
    filterFn: (row, columnId, value: string) =>
      String(row.getValue(columnId)).toLowerCase().includes(value.toLowerCase())
  },
  {
    accessorKey: 'registerNumber',
    header: 'Регистр',
    cell: ({ row }) => <div>{row.getValue('registerNumber')}</div>
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Нэр <ArrowUpDown className="ml-1 size-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('name')}</div>
  },
  {
    accessorKey: 'data',
    header: 'Утга',
    cell: ({ row }) => <div>{row.getValue('data')}</div>
  }
]

export function AllInfoList() {
  const [fieldNames, setFieldNames] = useState<string[]>([])
  const [field, setField] = useState<string>(ALL_FIELDS)

  const [data, setData] = useState<UserInfoListRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    listFieldNames().then((result) => {
      if (result.success) setFieldNames(result.data)
    })
  }, [])

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await loadAllUserInfo(
        field === ALL_FIELDS ? undefined : field
      )
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setData(result.data)
      setRowSelection({})
    } catch {
      toast.error(GENERIC_ERROR)
    } finally {
      setIsLoading(false)
    }
  }, [field])

  useEffect(() => {
    load()
  }, [load])

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
    state: { sorting, columnFilters, rowSelection }
  })

  const filteredRows = table.getFilteredRowModel().rows
  const selectedIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
  const showSelectAllFiltered =
    selectedIds.length > 0 && selectedIds.length < filteredRows.length

  const selectAllFiltered = () => {
    const next: Record<string, boolean> = {}
    for (const row of filteredRows) next[row.id] = true
    table.setRowSelection(next)
  }

  const nameFilter =
    (table.getColumn('studentName')?.getFilterValue() as string) ?? ''

  const handleExport = () => {
    const rows = filteredRows.map((row) => row.original)
    if (rows.length === 0) {
      toast.error('Экспортлох мэдээлэл алга байна')
      return
    }
    downloadCsv(rows)
  }

  const runDelete = async () => {
    if (selectedIds.length === 0) return
    setIsDeleting(true)
    try {
      const result = await deleteUserInfoBulk({ ids: selectedIds })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(`${result.count} мөр устгагдлаа`)
      setDeleteOpen(false)
      await load()
    } catch {
      toast.error(GENERIC_ERROR)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={field} onValueChange={(value) => setField(value)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FIELDS}>Бүх талбар</SelectItem>
            {fieldNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative w-56">
          <Search className="-translate-y-1/2 absolute top-1/2 left-2 size-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Сурагчийн нэрээр шүүх"
            value={nameFilter}
            onChange={(e) =>
              table.getColumn('studentName')?.setFilterValue(e.target.value)
            }
          />
        </div>

        <Button
          className="ml-auto"
          variant="outline"
          onClick={handleExport}
          disabled={isLoading || filteredRows.length === 0}
        >
          <Download className="size-4" /> CSV
        </Button>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
          <span className="font-medium text-sm">
            {selectedIds.length} мөр сонгосон
          </span>
          {showSelectAllFiltered && (
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={selectAllFiltered}
            >
              Шүүлтэд тохирох бүх {filteredRows.length} мөрийг сонгох
            </Button>
          )}
          <Button
            variant="destructive"
            className="ml-auto"
            disabled={isDeleting}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-1 size-4" /> Устгах
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
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
                  className="h-24 text-center text-muted-foreground"
                >
                  Мэдээлэл алга байна
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <div className="flex-1 text-muted-foreground text-sm">
          {selectedIds.length} / {filteredRows.length} мөр сонгосон
        </div>
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

      <ConfirmActionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Нэмэлт мэдээлэл устгах"
        description={`${selectedIds.length} мөрийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`}
        confirmLabel="Устгах"
        destructive
        isLoading={isDeleting}
        onConfirm={runDelete}
      />
    </div>
  )
}
