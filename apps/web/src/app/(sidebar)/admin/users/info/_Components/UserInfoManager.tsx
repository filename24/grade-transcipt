'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AllInfoList } from './AllInfoList'
import { BulkInfoEditor } from './BulkInfoEditor'
import { StudentInfoManager } from './StudentInfoManager'

export function UserInfoManager() {
  return (
    <Tabs defaultValue="bulk" className="w-full">
      <TabsList>
        <TabsTrigger value="bulk">Багцаар оруулах</TabsTrigger>
        <TabsTrigger value="single">Сурагчаар удирдах</TabsTrigger>
        <TabsTrigger value="all">Бүх жагсаалт</TabsTrigger>
      </TabsList>
      <TabsContent value="bulk" className="mt-6">
        <BulkInfoEditor />
      </TabsContent>
      <TabsContent value="single" className="mt-6">
        <StudentInfoManager />
      </TabsContent>
      <TabsContent value="all" className="mt-6">
        <AllInfoList />
      </TabsContent>
    </Tabs>
  )
}
