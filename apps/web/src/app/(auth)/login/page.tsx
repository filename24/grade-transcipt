import {
  EsisLoginForm,
  RegisterLoginForm
} from '@/app/(auth)/login/_Components/LoginForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { auth } from '@/utils/auth'
import { redirect } from 'next/navigation'

export default async function Login({
  searchParams
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  const params = await searchParams

  if (session) {
    if (session.user?.role === 'TEACHER') {
      redirect('/teacher')
    }
    if (params?.callbackUrl) redirect(params.callbackUrl as string)

    redirect('/dash')
  }
  return (
    <div className="flex min-h-[85vh] w-max items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Tabs defaultValue="register">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">Сурагч</TabsTrigger>
            <TabsTrigger value="esis">Багш</TabsTrigger>
          </TabsList>
          <TabsContent value="register">
            <RegisterLoginForm />
          </TabsContent>
          <TabsContent value="esis">
            <EsisLoginForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
