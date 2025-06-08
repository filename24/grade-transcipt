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
import { useState, type Dispatch, type SetStateAction } from 'react'
import type { GradeConfig } from './Gradetable'
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

const FormSchema = z.object({
  className: z.string().optional(),
  classType: z.string().optional(),
  status: z.string().optional(),
  classGrade: z.string().optional()
})

export function GradeConfigDialog({
  config,
  setConfig
}: { setConfig: Dispatch<SetStateAction<GradeConfig>>; config: GradeConfig }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema)
  })
  const [open, setOpen] = useState(false)
  const handleSubmit = (data: z.infer<typeof FormSchema>) => {
    const { className, classType, classGrade } = data
    const classCode = `${className} ${classType}`
    const status = data.status as GradeStatusType
    setConfig({
      classCode,
      classGrade,
      status
    })

    setOpen(false)
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
                    <Input id="classGrade" defaultValue="12а" {...field} />
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
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
