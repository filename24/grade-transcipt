'use client'

import { ClipboardList } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'

import { UserInfoEditor } from '../info/_Components/UserInfoEditor'

interface UserInfoSheetProps {
  userId: string
  userName: string
}

export default function UserInfoSheet({
  userId,
  userName
}: UserInfoSheetProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label={`${userName}-н нэмэлт мэдээлэл`}
          title="Нэмэлт мэдээлэл"
        >
          <ClipboardList className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-2xl"
      >
        <SheetHeader>
          <SheetTitle>{userName} — Нэмэлт мэдээлэл</SheetTitle>
          <SheetDescription>
            Админ гараар оруулсан нэмэлт мэдээлэл
          </SheetDescription>
        </SheetHeader>

        {/* 시트가 열렸을 때만 마운트되어 그때 조회한다 */}
        {open && (
          <div className="px-4 pb-4">
            <UserInfoEditor userId={userId} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
