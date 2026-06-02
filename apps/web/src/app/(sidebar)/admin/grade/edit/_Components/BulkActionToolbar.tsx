'use client'

import { GradeStatus, GradeStatusKeys, type GradeStatusType } from '@gt/esis'
import { Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { deleteGrades, updateGradesStatus } from '../actions'
import { ConfirmActionDialog } from './ConfirmActionDialog'

interface BulkActionToolbarProps {
  selectedIds: string[]
  onDone: () => void
}

export function BulkActionToolbar({
  selectedIds,
  onDone
}: BulkActionToolbarProps) {
  const [status, setStatus] = useState<GradeStatusType | ''>('')
  const [statusOpen, setStatusOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const count = selectedIds.length
  if (count === 0) {
    return null
  }

  const runStatusUpdate = () => {
    if (!status) {
      return
    }
    startTransition(async () => {
      const result = await updateGradesStatus({ gradeIds: selectedIds, status })
      if (result.success) {
        toast.success(`${result.count} мөрийн төлөв шинэчлэгдлээ.`)
        setStatusOpen(false)
        setStatus('')
        onDone()
      } else {
        toast.error(result.error)
      }
    })
  }

  const runDelete = () => {
    startTransition(async () => {
      const result = await deleteGrades({ gradeIds: selectedIds })
      if (result.success) {
        toast.success(`${result.count} мөр устгагдлаа.`)
        setDeleteOpen(false)
        onDone()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
      <span className="font-medium text-sm">{count} мөр сонгосон</span>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as GradeStatusType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Төлөв сонгох" />
          </SelectTrigger>
          <SelectContent>
            {GradeStatusKeys.map((key) => (
              <SelectItem key={key} value={key}>
                {GradeStatus[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          disabled={!status || isPending}
          onClick={() => setStatusOpen(true)}
        >
          Төлөв өөрчлөх
        </Button>

        <Button
          variant="destructive"
          disabled={isPending}
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Устгах
        </Button>
      </div>

      <ConfirmActionDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        title="Төлөв өөрчлөх"
        description={
          status
            ? `${count} мөрийн төлвийг "${GradeStatus[status]}" болгох уу?`
            : ''
        }
        confirmLabel="Баталгаажуулах"
        isLoading={isPending}
        onConfirm={runStatusUpdate}
      />

      <ConfirmActionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Дүн устгах"
        description={`${count} мөрийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`}
        confirmLabel="Устгах"
        destructive
        isLoading={isPending}
        onConfirm={runDelete}
      />
    </div>
  )
}
