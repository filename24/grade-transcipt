'use client'

import type { Grade } from '@gt/database/browser'
import type { GradeStatusType } from '@gt/esis'
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingFn,
  type SortingState,
  useReactTable,
  type VisibilityState
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import { GradeStatusBadge } from '@/components/GradeStatusBadge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
import { usePersistentState } from '@/hooks/use-persistent-state'
import { getSubjectSortId, resolveClassCode } from '@/utils'
import { CURRECT_SEMESTER } from '@/utils/constants'

import CreateGradeDialog from './CreateGradeDialog'
import DeleteGradeDialog from './DeleteGradeDialog'
import EditGradeDialog from './EditGradeDialog'

// /dash/grade 와 동일한 과목 정렬 알고리즘. classCode를 과목 이름으로 해석해 비교한다.
const subjectNameSort: SortingFn<Grade> = (rowA, rowB) =>
  getSubjectSortId(resolveClassCode(rowA.original.classCode)) -
  getSubjectSortId(resolveClassCode(rowB.original.classCode))

// 기본 학기 필터. CURRECT_SEMESTER(0=1학기, 1=2학기)에 1을 더한 실제 학기 값.
const DEFAULT_SEMESTER = CURRECT_SEMESTER + 1

// 학생별 성적 테이블의 컬럼 표시 설정을 localStorage에 저장하는 키.
const COLUMN_VISIBILITY_KEY = 'admin-student-grade:column-visibility'

interface StudentGradeTableProps {
  data: Grade[]
  onUpdate: () => void
  // 등록번호가 주어지면 "성적 추가" 버튼을 노출한다 (관리자용).
  registerNumber?: string
}

export default function StudentGradeTable({
  data,
  onUpdate,
  registerNumber
}: StudentGradeTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  // 기본적으로 현재 학기만 보이도록 학기 필터를 미리 적용한다.
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: 'semester', value: DEFAULT_SEMESTER.toString() }
  ])
  const [columnVisibility, setColumnVisibility] =
    usePersistentState<VisibilityState>(COLUMN_VISIBILITY_KEY, {})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 50
  })

  // 고유한 학년 값 추출
  const uniqueGrades = React.useMemo(() => {
    const grades = [...new Set(data.map((item) => item.classGrade))]
    return grades.sort((a, b) => Number(a) - Number(b))
  }, [data])

  // 고유한 학기 값 추출 (필터 옵션용)
  const uniqueSemesters = React.useMemo(() => {
    const semesters = [...new Set(data.map((item) => item.semester))]
    return semesters.sort((a, b) => a - b)
  }, [data])

  const columns: ColumnDef<Grade>[] = [
    {
      accessorKey: 'displayName',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            과목명
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue('displayName')}</div>,
      sortingFn: subjectNameSort
    },
    {
      accessorKey: 'classCode',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            과목
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const classCode = row.getValue('classCode') as string
        const courseName = resolveClassCode(classCode)
        return (
          <div>
            {courseName}
            {courseName.trim() !== classCode && (
              <span className="ml-1 text-muted-foreground text-xs">
                ({classCode})
              </span>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'academicYear',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            학년도
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue('academicYear')}</div>
    },
    {
      accessorKey: 'semester',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            학기
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue('semester')}</div>,
      // semester는 숫자라 기본 문자열 필터로는 매칭되지 않으므로 명시적 비교.
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) {
          return true
        }
        return String(row.getValue(columnId)) === String(filterValue)
      }
    },
    {
      accessorKey: 'classGrade',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            학년
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue('classGrade')}</div>
    },
    {
      accessorKey: 'point',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            점수
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue('point')}</div>
    },
    {
      accessorKey: 'grade',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            등급
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue('grade')}</div>
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            상태
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <GradeStatusBadge status={row.getValue('status') as GradeStatusType} />
      )
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const grade = row.original
        const courseName = resolveClassCode(grade.classCode)

        const copyToClipboard = () => {
          const text = `${grade.displayName}\t${courseName}\t${grade.classCode}\t${grade.academicYear}\t${grade.semester}\t${grade.classGrade}\t${grade.point}\t${grade.grade}\t${grade.status}`
          navigator.clipboard.writeText(text)
          toast.success('클립보드에 복사되었습니다')
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <EditGradeDialog grade={grade} onSuccess={onUpdate}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  수정
                </DropdownMenuItem>
              </EditGradeDialog>

              <DeleteGradeDialog gradeId={grade.id} onSuccess={onUpdate}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  삭제
                </DropdownMenuItem>
              </DeleteGradeDialog>

              <DropdownMenuItem onClick={copyToClipboard}>
                복사
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  const table = useReactTable({
    data,
    columns,
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

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder="과목명으로 필터..."
          value={
            (table.getColumn('displayName')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('displayName')?.setFilterValue(event.target.value)
          }
          className="max-w-xs"
        />

        <Select
          value={
            (table.getColumn('semester')?.getFilterValue() as string) ?? 'all'
          }
          onValueChange={(value) =>
            table
              .getColumn('semester')
              ?.setFilterValue(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="학기 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 학기</SelectItem>
            {uniqueSemesters.map((semester) => (
              <SelectItem key={semester} value={semester.toString()}>
                {semester}학기
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={
            (table.getColumn('classGrade')?.getFilterValue() as string) ?? 'all'
          }
          onValueChange={(value) =>
            table
              .getColumn('classGrade')
              ?.setFilterValue(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="학년 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 학년</SelectItem>
            {uniqueGrades.map((grade) => (
              <SelectItem key={grade} value={grade.toString()}>
                {grade}학년
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {registerNumber && (
          <div className="ml-auto">
            <CreateGradeDialog
              registerNumber={registerNumber}
              onSuccess={onUpdate}
            />
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={registerNumber ? '' : 'ml-auto'}
            >
              Columns <ChevronDown className="ml-2 h-4 w-4" />
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
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-muted-foreground text-sm">
          {table.getFilteredRowModel().rows.length} row(s) total.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
