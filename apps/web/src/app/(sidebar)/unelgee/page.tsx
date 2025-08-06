import { AppSidebarHeader } from '../_Components/Header'

import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'

export default async function UnelgeePage() {
  return (
    <main>
      <AppSidebarHeader>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbPage>Гүйцэтгэлийн үнэлгээ</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </AppSidebarHeader>

      <div className="flex min-h-[85vh] w-max items-center justify-center p-6 md:p-10">
        asdf
      </div>
    </main>
  )
}
