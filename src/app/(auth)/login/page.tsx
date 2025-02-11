import { LoginForm } from './_Components/LoginForm'
import { auth } from '@/utils/auth'
import { redirect } from 'next/navigation'

export default async function Login({
  searchParams
}: { searchParams?: { [key: string]: string | undefined } }) {
  const session = await auth()

  if (session) {
    if (searchParams?.callbackUrl) redirect(searchParams.callbackUrl)

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
