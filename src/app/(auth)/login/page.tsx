import { LoginForm } from '@/components/login-form'
import { auth } from '@/utils/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Login() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session) {
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
