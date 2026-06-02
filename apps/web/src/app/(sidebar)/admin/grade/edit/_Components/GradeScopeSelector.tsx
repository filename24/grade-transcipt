'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface GradeScopeSelectorProps {
  academicYears: string[]
  semesters: number[]
  academicYear: string
  semester: number
}

export function GradeScopeSelector({
  academicYears,
  semesters,
  academicYear,
  semester
}: GradeScopeSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateScope = (key: 'academicYear' | 'semester', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="grid gap-1.5">
        <Label className="text-xs">Хичээлийн жил</Label>
        <Select
          value={academicYear}
          onValueChange={(value) => updateScope('academicYear', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Хичээлийн жил" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label className="text-xs">Хагас жил</Label>
        <Select
          value={String(semester)}
          onValueChange={(value) => updateScope('semester', value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Хагас жил" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((value) => (
              <SelectItem key={value} value={String(value)}>
                {value}-р хагас жил
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
