import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { auth } from '@/utils/better-auth'

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return redirect('/login')
  }
  return redirect('/dash')
}
