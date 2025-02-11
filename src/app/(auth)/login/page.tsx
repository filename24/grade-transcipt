import { LoginForm } from './_Components/LoginForm'
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
    if (params?.callbackUrl) redirect(params.callbackUrl as string)

    redirect('/dash')
  }
  return (
    <div className="flex min-h-[85vh] w-max items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
