'use client'

import type { Grade } from '@gt/database/browser'
import { FileSpreadsheet, Loader2 } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'

import StudentGradeTable from '../../grade/student/_Components/StudentGradeTable'
import { getGradesByRegisterNumber } from '../../grade/student/actions'

interface UserGradesSheetProps {
  registerNumber: string
  userName: string
}

export default function UserGradesSheet({
  registerNumber,
  userName
}: UserGradesSheetProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [grades, setGrades] = React.useState<Grade[]>([])

  const loadGrades = React.useCallback(async () => {
    setLoading(true)
    try {
      const result = await getGradesByRegisterNumber(registerNumber)
      if (result.success) {
        setGrades(result.data ?? [])
      } else {
        toast.error(result.error || '성적 조회에 실패했습니다')
      }
    } catch (_) {
      toast.error('성적 조회 중 오류가 발생했습니다')
    }
    setLoading(false)
  }, [registerNumber])

  // 시트가 열릴 때만 조회한다 (목록 렌더 시 N+1 조회 방지).
  React.useEffect(() => {
    if (open) {
      loadGrades()
    }
  }, [open, loadGrades])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label={`${userName}-н дүн харах`}
          title="Дүн харах"
        >
          <FileSpreadsheet className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-4xl"
      >
        <SheetHeader>
          <SheetTitle>{userName} — Дүн</SheetTitle>
          <SheetDescription>{registerNumber}</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <StudentGradeTable
            data={grades}
            onUpdate={loadGrades}
            registerNumber={registerNumber}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
