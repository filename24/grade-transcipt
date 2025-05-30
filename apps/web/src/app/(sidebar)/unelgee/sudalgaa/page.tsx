import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { AppSidebarHeader } from '../../_Components/Header'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export default async function TeacherPage() {
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
            <BreadcrumbPage>Судалгаа бүртгэх</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </AppSidebarHeader>

      <div className="p-2 md:p-6">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>
              Deploy your new project in one-click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Регистрын дугаар</Label>
                  <Input
                    id="registerNumber"
                    name="registerNumber"
                    type="text"
                    placeholder="АБ12345678"
                    maxLength={10}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="type">Судалгаа бөглөх хэлбэр</Label>
                  <Select>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Сонгох" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="1">Сурагч</SelectItem>
                      <SelectItem value="2">Эцэг эх</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Deploy</Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
