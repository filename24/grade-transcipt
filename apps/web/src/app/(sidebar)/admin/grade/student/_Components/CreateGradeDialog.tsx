'use client'

import { CourseCode, CourseCodeKeys, GradeStatusKeys } from '@gt/esis'
import { Loader2, Plus } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { calculateGradeCode } from '@/utils'
import { CURRECT_ACADEMIC_YEAR, CURRECT_SEMESTER } from '@/utils/constants'

import { createGrade } from '../actions'

interface CreateGradeDialogProps {
  registerNumber: string
  onSuccess: () => void
}

const DEFAULT_SEMESTER = (CURRECT_SEMESTER + 1).toString()

export default function CreateGradeDialog({
  registerNumber,
  onSuccess
}: CreateGradeDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [classCode, setClassCode] = React.useState('')
  const [classGrade, setClassGrade] = React.useState('')
  const [point, setPoint] = React.useState('')
  const [status, setStatus] = React.useState<string>('NEW')
  const [semester, setSemester] = React.useState(DEFAULT_SEMESTER)
  const [academicYear, setAcademicYear] = React.useState<string>(
    CURRECT_ACADEMIC_YEAR
  )

  React.useEffect(() => {
    if (open) {
      setClassCode('')
      setClassGrade('')
      setPoint('')
      setStatus('NEW')
      setSemester(DEFAULT_SEMESTER)
      setAcademicYear(CURRECT_ACADEMIC_YEAR)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!classCode) {
      toast.error('과목을 선택해주세요')
      return
    }

    if (!classGrade.trim()) {
      toast.error('학년을 입력해주세요')
      return
    }

    const pointNum = Number.parseFloat(point)
    if (Number.isNaN(pointNum) || pointNum < 0 || pointNum > 100) {
      toast.error('점수는 0~100 사이의 숫자여야 합니다')
      return
    }

    const semesterNum = Number.parseInt(semester)
    if (Number.isNaN(semesterNum) || semesterNum < 1 || semesterNum > 3) {
      toast.error('학기는 1, 2, 3 중 하나여야 합니다')
      return
    }

    if (!/^\d{4}$/.test(academicYear)) {
      toast.error('학년도는 4자리 숫자여야 합니다')
      return
    }

    setIsLoading(true)

    try {
      const result = await createGrade({
        registerNumber,
        classCode,
        classGrade: classGrade.trim(),
        point: pointNum,
        grade: calculateGradeCode(pointNum),
        status: status as 'APPROVED' | 'PENDING' | 'REJECTED' | 'NEW',
        semester: semesterNum,
        academicYear
      })

      if (result.success) {
        toast.success('성적이 추가되었습니다')
        setOpen(false)
        onSuccess()
      } else {
        toast.error(result.error || '성적 추가에 실패했습니다')
      }
    } catch (_) {
      toast.error('성적 추가 중 오류가 발생했습니다')
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          성적 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>성적 추가</DialogTitle>
          <DialogDescription>
            새 성적 레코드를 추가합니다. 등급은 점수로부터 자동 계산됩니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="classCode" className="text-right">
                과목
              </Label>
              <Select value={classCode} onValueChange={setClassCode}>
                <SelectTrigger id="classCode" className="col-span-3">
                  <SelectValue placeholder="과목 선택" />
                </SelectTrigger>
                <SelectContent>
                  {CourseCodeKeys.map((code) => (
                    <SelectItem key={code} value={code}>
                      {CourseCode[code]} ({code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="classGrade" className="text-right">
                학년
              </Label>
              <Input
                id="classGrade"
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="col-span-3"
                placeholder="예: 10"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="point" className="text-right">
                점수
              </Label>
              <Input
                id="point"
                type="number"
                value={point}
                onChange={(e) => setPoint(e.target.value)}
                className="col-span-3"
                min={0}
                max={100}
                step={0.1}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                상태
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="col-span-3">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  {GradeStatusKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="semester" className="text-right">
                학기
              </Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger id="semester" className="col-span-3">
                  <SelectValue placeholder="학기 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="academicYear" className="text-right">
                학년도
              </Label>
              <Input
                id="academicYear"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="col-span-3"
                placeholder="예: 2024"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  추가 중...
                </>
              ) : (
                '추가'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
