'use client'

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { AppSidebarHeader } from '../../_Components/Header'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { getUnelgeeData } from './actions'
import { Input } from '@/components/ui/input'

export default function StudentPage() {
  const [state, action, pending] = useActionState(getUnelgeeData, undefined)

  if (state?.message) {
    toast.success(state.message)
  }

  if (state?.errors?.message) {
    toast.error(state.errors.message)
  }
  return (
    <main>
      <AppSidebarHeader>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/unelgee">
              Гүйцэтгэлийн үнэлгээ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ангийн журнал</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </AppSidebarHeader>

      <form action={action}>
        <div className="mx-auto w-full max-w-7xl grow p-3">
          <div className="mb-4 grid w-sm gap-1.5">
            <Label
              htmlFor="className"
              className="font-semibold text-xl tracking-tight"
            >
              Анги
            </Label>
            <Input placeholder="Жишээ: 12а" id="className" name="className" />
          </div>

          <div className="mb-4 grid w-full gap-1.5 md:w-[50%]">
            <Label
              htmlFor="registerNumbers"
              className="font-semibold text-xl tracking-tight"
            >
              Регистрын дугаар
            </Label>
            <Textarea
              placeholder="Регистрын дугаараа оруулна уу."
              className="h-[30vh] text-sm"
              id="registerNumbers"
              name="registerNumbers"
            />
            <p className="text-muted-foreground text-sm">
              LMS татаж авсан регистрийн дугааруудаа оруулж болно.
            </p>
          </div>

          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? (
              <>
                <Loader2 className="animate-spin" />
                Түр хүлээнэ үү...
              </>
            ) : (
              'Системээс татах'
            )}
          </Button>
        </div>
      </form>
    </main>
  )
}
