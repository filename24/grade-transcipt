import { auth } from '@/utils/auth'
import { redirect } from 'next/navigation'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { AppSidebarHeader } from '../_Components/Header'
export default async function AdminPage() {
  const session = await auth()

  if (session?.user?.role === 'ADMIN') {
    return (
      <>
        <AppSidebarHeader>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Main</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </AppSidebarHeader>

        <div className="md:p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-2xl tracking-tight">
              Hello World
            </h3>
            <p className="">
              Today is{' '}
              {Intl.DateTimeFormat('en', {
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
