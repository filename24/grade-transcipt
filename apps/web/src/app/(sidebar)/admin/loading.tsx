import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList
} from '@/components/ui/breadcrumb'
import { AppSidebarHeader } from '../_Components/Header'
import HomeLoading from '@/app/loading'
export default function AdminPage() {
  return (
    <>
      <AppSidebarHeader>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </AppSidebarHeader>

      <HomeLoading />
    </>
  )
}
