'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
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
  useActionState,
  useState,
  type Dispatch,
  type SetStateAction
} from 'react'
import {
  GradeStatus,
  GradeStatusKeys,
  type GradeStatusType,
  CourseCodeKeys,
  CourseCode
} from '@gt/esis'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem } from '@/components/ui/form'
import { editGradeData } from '../actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export const EditGradeSchema = z.object({
  className: z.string(),
  classType: z.string(),
  status: z.string(),
  classGrade: z.string().optional(),
  semester: z.string({ message: '학기를 세팅해주세요.' }),
  action: z.string()
})

export function GradeStateDialog() {
  const form = useForm<z.infer<typeof EditGradeSchema>>({
    resolver: zodResolver(EditGradeSchema)
  })
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (data: z.infer<typeof EditGradeSchema>) => {
    setIsLoading(true)
    editGradeData(data)
      .then((payload) => {
        toast.success(`${payload.message} count: ${payload.payload.count}`)
        setOpen(false)
        setIsLoading(false)
      })
      .catch((error: Error) => {
        toast.error(error.message)
        setIsLoading(false)
      })
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>설정</DialogTitle>
          <DialogDescription>
            성적을 업로드할때 기본값을 세팅해주세요.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="classGrade-1">학년</Label>
                <FormField
                  control={form.control}
                  name="classGrade"
                  render={({ field }) => (
                    <Input id="classGrade" placeholder="12а" {...field} />
                  )}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="className-1">과목</Label>
                <FormField
                  control={form.control}
                  name="className"
                  render={(field) => (
                    <FormItem>
                      <Select
                        onValueChange={field.field.onChange}
                        defaultValue={field.field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a class name" />
                        </SelectTrigger>
                        <SelectContent>
                          {CourseCodeKeys.map((value) => (
                            <SelectItem key={value} value={value}>
                              {CourseCode[value]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="classType-1">과목 형태</Label>
                <FormField
                  control={form.control}
                  name="classType"
                  render={(field) => (
                    <FormItem>
                      <Select
                        onValueChange={field.field.onChange}
                        defaultValue={field.field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a class type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="заавал">Заавал судлах</SelectItem>
                          <SelectItem value="сонгон">Сонгон судлах</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="semester-1">학기</Label>
                <FormField
                  control={form.control}
                  name="semester"
                  render={(field) => (
                    <FormItem>
                      <Select
                        onValueChange={field.field.onChange}
                        defaultValue={field.field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1학기</SelectItem>
                          <SelectItem value="2">2학기</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <Label>Status</Label>

                <FormField
                  control={form.control}
                  name="status"
                  render={(field) => (
                    <FormItem>
                      <Select
                        onValueChange={field.field.onChange}
                        defaultValue={field.field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          {GradeStatusKeys.map((value) => (
                            <SelectItem key={value} value={value}>
                              {GradeStatus[value]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <Label>Action</Label>

                <FormField
                  control={form.control}
                  name="action"
                  render={(field) => (
                    <FormItem>
                      <Select
                        onValueChange={field.field.onChange}
                        defaultValue={field.field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="edit">상태 변경</SelectItem>
                          <SelectItem value="delete">
                            삭제 후 다시 작성
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button disabled={isLoading} type="submit">
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Түр хүлээнэ үү...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
