import { auth } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { AppSidebarHeader } from '../_Components/Header'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export default async function TeacherPage() {
  const session = await auth()

  if (session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN') {
    return (
      <>
        <AppSidebarHeader>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/teacher">Багшийн систем</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Main</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </AppSidebarHeader>

        <div className="p-2 md:p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-2xl tracking-tight">
              Тавтай морилно уу, {session?.user?.name}
            </h3>
            <p className="">
              Өнөөдөр{' '}
              {Intl.DateTimeFormat('mn', {
                dateStyle: 'full'
              }).format(Date.now())}
            </p>
          </div>
        </div>
      </>
    )
  }

  return redirect('/dash')
}
