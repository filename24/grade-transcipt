'use client'

import type { Grade } from '@gt/database/browser'
import { Loader2 } from 'lucide-react'
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

import { updateGrade } from '../actions'

interface EditGradeDialogProps {
  grade: Grade
  onSuccess: () => void
  children: React.ReactNode
}

export default function EditGradeDialog({
  grade,
  onSuccess,
  children
}: EditGradeDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [point, setPoint] = React.useState(grade.point.toString())
  const [gradeValue, setGradeValue] = React.useState(grade.grade)
  const [status, setStatus] = React.useState<string>(grade.status)
  const [semester, setSemester] = React.useState(grade.semester.toString())
  const [academicYear, setAcademicYear] = React.useState(grade.academicYear)

  React.useEffect(() => {
    if (open) {
      setPoint(grade.point.toString())
      setGradeValue(grade.grade)
      setStatus(grade.status)
      setSemester(grade.semester.toString())
      setAcademicYear(grade.academicYear)
    }
  }, [open, grade])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const pointNum = Number.parseFloat(point)
    if (Number.isNaN(pointNum) || pointNum < 0 || pointNum > 100) {
      toast.error('점수는 0~100 사이의 숫자여야 합니다')
      return
    }

    if (!gradeValue.trim()) {
      toast.error('등급을 입력해주세요')
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
      const result = await updateGrade(grade.id, {
        point: pointNum,
        grade: gradeValue,
        status: status as 'APPROVED' | 'PENDING' | 'REJECTED' | 'NEW',
        semester: semesterNum,
        academicYear
      })

      if (result.success) {
        toast.success('성적이 수정되었습니다')
        setOpen(false)
        onSuccess()
      } else {
        toast.error(result.error || '성적 수정에 실패했습니다')
      }
    } catch (error) {
      toast.error('성적 수정 중 오류가 발생했습니다')
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>성적 수정</DialogTitle>
          <DialogDescription>성적 정보를 수정합니다</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">과목명</Label>
              <div className="col-span-3 text-sm">{grade.displayName}</div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">과목코드</Label>
              <div className="col-span-3 font-mono text-sm">
                {grade.classCode}
              </div>
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
              <Label htmlFor="grade" className="text-right">
                등급
              </Label>
              <Input
                id="grade"
                value={gradeValue}
                onChange={(e) => setGradeValue(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                상태
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">APPROVED</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                  <SelectItem value="NEW">NEW</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="semester" className="text-right">
                학기
              </Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className="col-span-3">
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
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
