'use client'

import {
  CourseCode,
  CourseCodeKeys,
  GradeStatus,
  GradeStatusKeys
} from '@gt/esis'
import type { Table } from '@tanstack/react-table'
import { useMemo } from 'react'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import type { ClassCodeFilterValue, GradeTableData } from './GradeAdminTable'

const ALL_VALUE = '__all__'

const COURSE_TYPES = [
  { value: 'заавал', label: 'Заавал судлах' },
  { value: 'сонгон', label: 'Сонгон судлах' }
] as const

interface GradeFilterBarProps {
  table: Table<GradeTableData>
}

export function GradeFilterBar({ table }: GradeFilterBarProps) {
  // classGrade 옵션은 현재 scope로 로드된 data에서 파생한다 (scope 내 값이므로 안전).
  const classGrades = useMemo(() => {
    const set = new Set<string>()
    for (const row of table.options.data) {
      if (row.classGrade) {
        set.add(row.classGrade)
      }
    }
    return Array.from(set).sort()
  }, [table.options.data])

  const classCodeFilter =
    (table.getColumn('classCode')?.getFilterValue() as
      | ClassCodeFilterValue
      | undefined) ?? {}
  const classGradeFilter =
    (table.getColumn('classGrade')?.getFilterValue() as string) ?? ALL_VALUE
  const statusFilter =
    (table.getColumn('status')?.getFilterValue() as string) ?? ALL_VALUE

  // 과목(subject)·유형(type)을 하나의 classCode 필터 객체로 합쳐 갱신한다.
  // 스프레드로 part의 명시적 undefined도 그대로 덮어써 "전체" 선택 시 해제되게 한다.
  const setClassCodePart = (part: ClassCodeFilterValue) => {
    const next: ClassCodeFilterValue = { ...classCodeFilter, ...part }
    const hasFilter = Boolean(next.subject) || Boolean(next.type)
    table.getColumn('classCode')?.setFilterValue(hasFilter ? next : undefined)
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="grid gap-1.5">
        <Label className="text-xs">Хичээл</Label>
        <Select
          value={classCodeFilter.subject ?? ALL_VALUE}
          onValueChange={(value) =>
            setClassCodePart({
              subject: value === ALL_VALUE ? undefined : value
            })
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Бүх хичээл" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Бүх хичээл</SelectItem>
            {CourseCodeKeys.map((key) => (
              <SelectItem key={key} value={key}>
                {CourseCode[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs">Төрөл</Label>
        <Select
          value={classCodeFilter.type ?? ALL_VALUE}
          onValueChange={(value) =>
            setClassCodePart({ type: value === ALL_VALUE ? undefined : value })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Бүх төрөл" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Бүх төрөл</SelectItem>
            {COURSE_TYPES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs">Анги</Label>
        <Select
          value={classGradeFilter}
          onValueChange={(value) =>
            table
              .getColumn('classGrade')
              ?.setFilterValue(value === ALL_VALUE ? undefined : value)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Бүх анги" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Бүх анги</SelectItem>
            {classGrades.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs">Төлөв</Label>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            table
              .getColumn('status')
              ?.setFilterValue(value === ALL_VALUE ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Бүх төлөв" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Бүх төлөв</SelectItem>
            {GradeStatusKeys.map((key) => (
              <SelectItem key={key} value={key}>
                {GradeStatus[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
