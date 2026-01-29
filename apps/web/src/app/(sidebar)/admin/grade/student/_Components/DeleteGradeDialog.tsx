'use client'

import { Loader2 } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import { deleteGrade } from '../actions'

interface DeleteGradeDialogProps {
  gradeId: string
  onSuccess: () => void
  children: React.ReactNode
}

export default function DeleteGradeDialog({
  gradeId,
  onSuccess,
  children
}: DeleteGradeDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const result = await deleteGrade(gradeId)

      if (result.success) {
        toast.success(result.message)
        setOpen(false)
        onSuccess()
      } else {
        toast.error(result.error || '성적 삭제에 실패했습니다')
      }
    } catch (error) {
      toast.error('성적 삭제 중 오류가 발생했습니다')
    }

    setIsLoading(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>성적 삭제 확인</AlertDialogTitle>
          <AlertDialogDescription>
            이 성적 레코드를 영구적으로 삭제하시겠습니까?
            <br />이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              '삭제'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
